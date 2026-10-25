import {
  EventRequirements,
  ScheduleItem,
  ScheduleConflict,
  TaskItem,
} from '../types/event';

/**
 * Converts "HH:mm" time string into total minutes from start of day
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const [hours, minutes] = timeStr.split(':').map((num) => parseInt(num, 10) || 0);
  return hours * 60 + minutes;
}

/**
 * Converts total minutes from start of day back to "HH:mm" string
 */
export function minutesToTime(totalMinutes: number): string {
  // Normalize to 24h cycle
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Detects schedule overlaps, duration breaches, dependency violations, and missing setup buffers
 */
export function detectScheduleConflicts(
  schedule: ScheduleItem[],
  eventStartTime: string,
  durationHours: number
): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];
  const eventStartMins = timeToMinutes(eventStartTime);
  const eventEndMins = eventStartMins + durationHours * 60;

  // 1. Check for Missing Setup Window before guest arrival
  const setupItems = schedule.filter((item) => item.isSetupCleanup && timeToMinutes(item.startTime) < eventStartMins);
  if (setupItems.length === 0) {
    conflicts.push({
      id: 'conflict-missing-setup',
      type: 'missing_setup',
      severity: 'medium',
      itemIds: [],
      description: `No setup buffer scheduled before main start time (${eventStartTime}). Vendors & hosts need at least 45-60 mins for soundcheck and venue prep.`,
      recommendedFix: `Add a "Venue & AV Setup" item starting 60 minutes prior to ${eventStartTime}.`,
    });
  }

  // 2. Check Overlaps between activities (excluding non-overlapping or intentional ambient background)
  for (let i = 0; i < schedule.length; i++) {
    const itemA = schedule[i];
    const aStart = timeToMinutes(itemA.startTime);
    const aEnd = timeToMinutes(itemA.endTime);

    // Check if item exceeds scheduled venue booking window
    if (aEnd > eventEndMins + 30) {
      // allow 30 min buffer for cleanup
      conflicts.push({
        id: `conflict-exceeded-${itemA.id}`,
        type: 'duration_exceeded',
        severity: 'high',
        itemIds: [itemA.id],
        description: `"${itemA.title}" ends at ${itemA.endTime}, which exceeds the ${durationHours}-hour booked event window (ending at ${minutesToTime(eventEndMins)}).`,
        recommendedFix: `Shorten this activity or extend the venue reservation duration.`,
      });
    }

    // Compare with other items
    for (let j = i + 1; j < schedule.length; j++) {
      const itemB = schedule[j];
      const bStart = timeToMinutes(itemB.startTime);
      const bEnd = timeToMinutes(itemB.endTime);

      // Check overlap: start of one is before end of other and vice versa
      const hasOverlap = Math.max(aStart, bStart) < Math.min(aEnd, bEnd);

      if (hasOverlap) {
        // Both can't be primary spotlight events at the same location
        const isBackgroundA = itemA.title.toLowerCase().includes('background') || itemA.title.toLowerCase().includes('photo booth');
        const isBackgroundB = itemB.title.toLowerCase().includes('background') || itemB.title.toLowerCase().includes('photo booth');

        if (!isBackgroundA && !isBackgroundB) {
          conflicts.push({
            id: `conflict-overlap-${itemA.id}-${itemB.id}`,
            type: 'overlap',
            severity: 'high',
            itemIds: [itemA.id, itemB.id],
            description: `Time collision detected: "${itemA.title}" (${itemA.startTime}-${itemA.endTime}) overlaps with "${itemB.title}" (${itemB.startTime}-${itemB.endTime}).`,
            recommendedFix: `Shift "${itemB.title}" to start after ${itemA.endTime} or run them sequentially.`,
          });
        }
      }

      // Check Dependency order
      if (itemB.dependencies && itemB.dependencies.includes(itemA.id)) {
        if (bStart < aEnd) {
          conflicts.push({
            id: `conflict-dep-${itemB.id}-${itemA.id}`,
            type: 'dependency_violation',
            severity: 'high',
            itemIds: [itemB.id, itemA.id],
            description: `Dependency conflict: "${itemB.title}" is scheduled at ${itemB.startTime}, before prerequisite "${itemA.title}" finishes at ${itemA.endTime}.`,
            recommendedFix: `Move "${itemB.title}" start time to at or after ${itemA.endTime}.`,
          });
        }
      }
    }
  }

  return conflicts;
}

/**
 * Generates initial schedule tailored to event type and start time
 */
export function generateDefaultSchedule(requirements: EventRequirements): ScheduleItem[] {
  const { startTime, durationHours, eventType } = requirements;
  const startMins = timeToMinutes(startTime);

  const schedule: ScheduleItem[] = [];

  // Setup Item (45 mins prior)
  const setupStartMins = startMins - 45;
  schedule.push({
    id: 'sched-setup',
    title: 'Venue Access, Catering Delivery & AV Check',
    startTime: minutesToTime(setupStartMins),
    endTime: startTime,
    durationMinutes: 45,
    description: 'Ensure tables, sound equipment, and initial welcome station are operational.',
    location: 'Main Venue Entry & Stage',
    responsibleParty: 'Event Coordinator & Technical Lead',
    isSetupCleanup: true,
  });

  if (eventType === 'birthday') {
    let currentMins = startMins;

    schedule.push({
      id: 'sched-doors-open',
      title: 'Guest Arrival, Welcome Mocktails & Photobooth',
      startTime: minutesToTime(currentMins),
      endTime: minutesToTime((currentMins += 45)),
      durationMinutes: 45,
      description: 'Guests arrive, check in, take Polaroid/digital photos, and enjoy soft music.',
      location: 'Reception Area',
      responsibleParty: 'Host / Welcome Team',
    });

    schedule.push({
      id: 'sched-icebreaker',
      title: 'Icebreaker Games & Welcome Announcement',
      startTime: minutesToTime(currentMins),
      endTime: minutesToTime((currentMins += 45)),
      durationMinutes: 45,
      description: 'Trivia, party games, or structured group activities.',
      responsibleParty: 'Master of Ceremonies / DJ',
      dependencies: ['sched-doors-open'],
    });

    schedule.push({
      id: 'sched-meal',
      title: 'Celebration Buffet & Main Course',
      startTime: minutesToTime(currentMins),
      endTime: minutesToTime((currentMins += 60)),
      durationMinutes: 60,
      description: 'Dinner/Lunch buffet served with dietary accommodations labeled.',
      location: 'Dining Hall',
      dependencies: ['sched-icebreaker'],
    });

    schedule.push({
      id: 'sched-cake',
      title: 'Birthday Toast, Cake Cutting & Speeches',
      startTime: minutesToTime(currentMins),
      endTime: minutesToTime((currentMins += 30)),
      durationMinutes: 30,
      description: 'Celebrant cake cutting ceremony, milestone wishes, and photo moment.',
      dependencies: ['sched-meal'],
    });

    schedule.push({
      id: 'sched-party',
      title: 'Open Dance Floor & Music Set',
      startTime: minutesToTime(currentMins),
      endTime: minutesToTime((currentMins += 60)),
      durationMinutes: 60,
      description: 'DJ party playlist, dancing, and mingling.',
      dependencies: ['sched-cake'],
    });

    schedule.push({
      id: 'sched-cleanup',
      title: 'Guest Departure & Venue Teardown',
      startTime: minutesToTime(currentMins),
      endTime: minutesToTime((currentMins += 30)),
      durationMinutes: 30,
      description: 'Distribute party favors, load out equipment, finalize venue inspection.',
      isSetupCleanup: true,
      dependencies: ['sched-party'],
    });
  } else if (eventType === 'college_festival') {
    let currentMins = startMins;

    schedule.push({
      id: 'sched-inauguration',
      title: 'Gates Open & Opening Ceremony',
      startTime: minutesToTime(currentMins),
      endTime: minutesToTime((currentMins += 45)),
      durationMinutes: 45,
      description: 'Student registration, welcome address, and dignitary lighting ceremony.',
      location: 'Main Auditorium / Open Air Stage',
    });

    schedule.push({
      id: 'sched-competitions',
      title: 'Inter-College Competitions & Tech Exhibitions',
      startTime: minutesToTime(currentMins),
      endTime: minutesToTime((currentMins += 120)),
      durationMinutes: 120,
      description: 'Multiple track events: hackathon, battle of bands, dance face-off.',
      dependencies: ['sched-inauguration'],
    });

    schedule.push({
      id: 'sched-food-fest',
      title: 'Food Truck Alley & Cultural Showcase',
      startTime: minutesToTime(currentMins),
      endTime: minutesToTime((currentMins += 60)),
      durationMinutes: 60,
      description: 'Culinary stalls open, street theater, acoustic open mic.',
    });

    schedule.push({
      id: 'sched-pro-show',
      title: 'Star Night / Headliner Performance',
      startTime: minutesToTime(currentMins),
      endTime: minutesToTime((currentMins += 90)),
      durationMinutes: 90,
      description: 'Celebrity artist performance, stage lighting, high-energy concert.',
      dependencies: ['sched-competitions'],
    });

    schedule.push({
      id: 'sched-cleanup',
      title: 'Crowd Dispersal & Security Sweeps',
      startTime: minutesToTime(currentMins),
      endTime: minutesToTime((currentMins += 45)),
      durationMinutes: 45,
      description: 'Orderly campus exit, stage power-down, student volunteer debrief.',
      isSetupCleanup: true,
    });
  } else {
    // Default general celebration (Wedding, Community, Gathering)
    let currentMins = startMins;

    schedule.push({
      id: 'sched-arrival',
      title: 'Guest Reception & Welcome Drinks',
      startTime: minutesToTime(currentMins),
      endTime: minutesToTime((currentMins += 45)),
      durationMinutes: 45,
      description: 'Guests arrive, check coats, sign guestbook, enjoy welcome canapes.',
    });

    schedule.push({
      id: 'sched-ceremony',
      title: 'Main Ceremony / Program Addresses',
      startTime: minutesToTime(currentMins),
      endTime: minutesToTime((currentMins += 60)),
      durationMinutes: 60,
      description: 'Primary vows, keynote celebration, or featured presentations.',
      dependencies: ['sched-arrival'],
    });

    schedule.push({
      id: 'sched-dinner',
      title: 'Catered Meal & Toast Speeches',
      startTime: minutesToTime(currentMins),
      endTime: minutesToTime((currentMins += 75)),
      durationMinutes: 75,
      description: 'Seated meal service with special dietary courses served promptly.',
      dependencies: ['sched-ceremony'],
    });

    schedule.push({
      id: 'sched-celebration',
      title: 'Entertainment, Dancing & Social Hour',
      startTime: minutesToTime(currentMins),
      endTime: minutesToTime((currentMins += 60)),
      durationMinutes: 60,
      description: 'Live entertainment or curated music, mingling, photo sessions.',
      dependencies: ['sched-dinner'],
    });

    schedule.push({
      id: 'sched-wrap',
      title: 'Farewell & Venue Pack-Down',
      startTime: minutesToTime(currentMins),
      endTime: minutesToTime((currentMins += 30)),
      durationMinutes: 30,
      description: 'Fond farewells, vendor breakdown, venue checklist sign-off.',
      isSetupCleanup: true,
      dependencies: ['sched-celebration'],
    });
  }

  // Adjust timing if total schedule exceeds durationHours
  const totalMins = schedule.reduce((sum, item) => sum + (item.isSetupCleanup ? 0 : item.durationMinutes), 0);
  if (totalMins > durationHours * 60) {
    // Already flagged by conflict detector!
  }

  return schedule;
}

/**
 * Generates standard milestones and actionable planning tasks relative to event date
 */
export function generateDefaultTasks(requirements: EventRequirements): TaskItem[] {
  const eventDate = new Date(requirements.date || Date.now());

  const subtractDays = (days: number): string => {
    const d = new Date(eventDate);
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  };

  return [
    {
      id: 'task-venue-contract',
      title: 'Lock Venue Reservation & Confirm Accessibility Entrances',
      category: 'venue',
      deadlineDate: subtractDays(30),
      isCompleted: true,
      priority: 'high',
      notes: 'Verify elevator access, wheelchair ramps, and loading dock access.',
    },
    {
      id: 'task-catering-tasting',
      title: 'Finalize Catering Menu & Collect Dietary Restrictions',
      category: 'catering',
      deadlineDate: subtractDays(21),
      isCompleted: false,
      priority: 'high',
      notes: `Special focus on: ${requirements.dietaryRequirements.join(', ') || 'Vegetarian and nut-free options'}.`,
    },
    {
      id: 'task-invitations-send',
      title: 'Send Digital & RSVP Invitations with Deadline',
      category: 'invitations',
      deadlineDate: subtractDays(21),
      isCompleted: true,
      priority: 'high',
      notes: `Target guest headcount: ${requirements.guestCount}.`,
    },
    {
      id: 'task-entertainment-playlist',
      title: 'Curate Music Playlist & Review AV Sound Equipment',
      category: 'entertainment',
      deadlineDate: subtractDays(10),
      isCompleted: false,
      priority: 'medium',
      notes: 'Check Bluetooth PA system, microphones, and Spotify backup playlist.',
    },
    {
      id: 'task-decor-supplies',
      title: `Order/Assemble "${requirements.theme}" Decorations & Signage`,
      category: 'decor',
      deadlineDate: subtractDays(7),
      isCompleted: false,
      priority: 'medium',
    },
    {
      id: 'task-vendor-final-check',
      title: 'Reconfirm Arrival Times with All Vendors & Coordinator',
      category: 'coordination',
      deadlineDate: subtractDays(3),
      isCompleted: false,
      priority: 'high',
      notes: 'Share venue contact, loading dock map, and scheduled setup time.',
    },
    {
      id: 'task-weather-check',
      title: 'Review 48-Hour Weather Forecast & Confirm Rain Shelter Protocol',
      category: 'logistics',
      deadlineDate: subtractDays(2),
      isCompleted: false,
      priority: requirements.venueType === 'outdoor' ? 'high' : 'low',
      notes: requirements.venueType === 'outdoor' ? 'Crucial for outdoor venue setup.' : 'Indoor venue - check guest arrival umbrella stand.',
    },
    {
      id: 'task-day-of-kit',
      title: 'Pack Day-Of Emergency Kit (Tape, Scissors, First Aid, Extra Chargers)',
      category: 'logistics',
      deadlineDate: subtractDays(1),
      isCompleted: false,
      priority: 'medium',
    },
  ];
}
