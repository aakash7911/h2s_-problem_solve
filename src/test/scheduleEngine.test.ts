import { describe, it, expect } from 'vitest';
import {
  timeToMinutes,
  minutesToTime,
  detectScheduleConflicts,
  generateDefaultSchedule,
} from '../utils/scheduleEngine';
import { ScheduleItem, EventRequirements } from '../types/event';

describe('Schedule Engine & Conflict Detection', () => {
  it('converts time strings to minutes and back accurately', () => {
    expect(timeToMinutes('00:00')).toBe(0);
    expect(timeToMinutes('18:30')).toBe(1110);
    expect(timeToMinutes('23:59')).toBe(1439);

    expect(minutesToTime(0)).toBe('00:00');
    expect(minutesToTime(1110)).toBe('18:30');
    expect(minutesToTime(1439)).toBe('23:59');
  });

  it('detects missing setup buffer when no setup exists before event start', () => {
    const schedule: ScheduleItem[] = [
      {
        id: '1',
        title: 'Guest Arrival',
        startTime: '18:00',
        endTime: '19:00',
        durationMinutes: 60,
        description: 'Doors open',
      },
    ];

    const conflicts = detectScheduleConflicts(schedule, '18:00', 4);
    expect(conflicts.some((c) => c.type === 'missing_setup')).toBe(true);
  });

  it('detects overlapping activities', () => {
    const schedule: ScheduleItem[] = [
      {
        id: 's0',
        title: 'Venue Setup',
        startTime: '17:00',
        endTime: '18:00',
        durationMinutes: 60,
        description: 'Setup',
        isSetupCleanup: true,
      },
      {
        id: 's1',
        title: 'Main Keynote',
        startTime: '18:00',
        endTime: '19:00',
        durationMinutes: 60,
        description: 'Speaker',
      },
      {
        id: 's2',
        title: 'Acoustic Band Performance',
        startTime: '18:30', // Overlaps with keynote
        endTime: '19:30',
        durationMinutes: 60,
        description: 'Band',
      },
    ];

    const conflicts = detectScheduleConflicts(schedule, '18:00', 4);
    const overlapConflict = conflicts.find((c) => c.type === 'overlap');
    expect(overlapConflict).toBeDefined();
    expect(overlapConflict?.itemIds).toContain('s1');
    expect(overlapConflict?.itemIds).toContain('s2');
  });

  it('detects dependency sequence violations', () => {
    const schedule: ScheduleItem[] = [
      {
        id: 's0',
        title: 'Venue Setup',
        startTime: '17:00',
        endTime: '18:00',
        durationMinutes: 60,
        description: 'Setup',
        isSetupCleanup: true,
      },
      {
        id: 's1',
        title: 'Opening Ceremony',
        startTime: '18:00',
        endTime: '19:00',
        durationMinutes: 60,
        description: 'Opening',
      },
      {
        id: 's2',
        title: 'Awards Ceremony',
        startTime: '18:30', // Starts before prerequisite s1 ends at 19:00
        endTime: '19:30',
        durationMinutes: 60,
        description: 'Awards',
        dependencies: ['s1'],
      },
    ];

    const conflicts = detectScheduleConflicts(schedule, '18:00', 4);
    const depConflict = conflicts.find((c) => c.type === 'dependency_violation');
    expect(depConflict).toBeDefined();
    expect(depConflict?.description).toContain('prerequisite');
  });

  it('generates conflict-free default schedule with setup window', () => {
    const mockReq: EventRequirements = {
      id: 'test',
      title: 'Birthday Bash',
      eventType: 'birthday',
      date: '2026-11-20',
      startTime: '18:00',
      durationHours: 4,
      guestCount: 40,
      totalBudget: 3000,
      currency: 'USD',
      location: 'Central Park',
      theme: 'Sunset',
      venueType: 'indoor',
      dietaryRequirements: [],
      accessibilityRequirements: [],
      mustHaveActivities: [],
      optionalFeatures: [],
      priority: 'balanced',
      riskTolerance: 'moderate',
      contingencyPercentage: 10,
    };

    const schedule = generateDefaultSchedule(mockReq);
    expect(schedule.length).toBeGreaterThan(3);

    // Verify first item is setup starting prior to 18:00
    const firstItem = schedule[0];
    expect(firstItem.isSetupCleanup).toBe(true);
    expect(timeToMinutes(firstItem.startTime)).toBeLessThan(timeToMinutes('18:00'));

    const conflicts = detectScheduleConflicts(schedule, mockReq.startTime, mockReq.durationHours);
    expect(conflicts.length).toBe(0);
  });
});
