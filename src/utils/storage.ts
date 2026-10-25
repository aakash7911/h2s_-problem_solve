import { EventPlan, EventRequirements } from '../types/event';
import { calculateBudgetBreakdown, generateDefaultExpenses } from './budgetEngine';
import { generateDefaultSchedule, detectScheduleConflicts, generateDefaultTasks } from './scheduleEngine';
import { analyzeRisks } from './riskEngine';
import { generateDemoVendors } from './vendorEngine';
import { calculatePlanCompleteness, generateRecommendations } from './completenessEngine';
import { generateDefaultChecklists } from './exportUtils';

const STORAGE_KEY = 'eventwise_saved_plans_v1';
const ACTIVE_PLAN_KEY = 'eventwise_active_plan_id';

/**
 * Creates a fully initialized plan object from user requirements
 */
export function createPlanFromRequirements(
  requirements: EventRequirements,
  isAI: boolean = false,
  aiProvider: 'gemini' | 'openai' | 'deterministic_engine' = 'deterministic_engine'
): EventPlan {
  const defaultItems = generateDefaultExpenses(requirements);
  const budget = calculateBudgetBreakdown(
    requirements.totalBudget,
    requirements.currency,
    defaultItems,
    requirements.contingencyPercentage || 10,
    requirements.eventType
  );

  const schedule = generateDefaultSchedule(requirements);
  const scheduleConflicts = detectScheduleConflicts(schedule, requirements.startTime, requirements.durationHours);
  const tasks = generateDefaultTasks(requirements);
  const checklists = generateDefaultChecklists(requirements.eventType);
  const vendors = generateDemoVendors(requirements, budget);
  const risks = analyzeRisks(requirements, budget);
  const recommendations = generateRecommendations(requirements, budget);
  const completeness = calculatePlanCompleteness(requirements, budget, scheduleConflicts, tasks, risks);

  const conceptRationale = {
    themeConcept: `${requirements.theme || 'Vibrant Celebration'} Concept`,
    atmosphereDescription: `An energetic, thoughtfully coordinated ${requirements.eventType.replace('_', ' ')} balancing budget discipline with memorable guest moments.`,
    targetAudienceFit: `Tailored for ${requirements.guestCount} attendees with active focus on ${requirements.priority.replace('_', ' ')}.`,
    keySuccessFactors: [
      'Strict adherence to essential vendor contracts to eliminate overspending',
      'Buffer-conscious schedule with clear guest arrival and transition flows',
      'Robust allergen and accessibility accommodations for attendee peace of mind',
    ],
  };

  return {
    id: requirements.id || `plan-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isAIGenerated: isAI,
    aiProviderUsed: aiProvider,
    requirements,
    conceptRationale,
    budget,
    schedule,
    scheduleConflicts,
    tasks,
    checklists,
    vendors,
    risks,
    recommendations,
    completeness,
    changeHistory: [
      {
        timestamp: new Date().toISOString(),
        description: isAI ? 'Initial AI plan generated' : 'Initial deterministic plan created',
        impactSummary: `Configured base budget of ${requirements.currency} ${requirements.totalBudget.toLocaleString()} for ${requirements.guestCount} guests.`,
      },
    ],
  };
}

/**
 * Pre-seeded sample plans for immediate review and demonstration
 */
export function getSamplePlans(): EventPlan[] {
  // Sample 1: 21st Birthday Party
  const bdayReq: EventRequirements = {
    id: 'plan-sample-birthday',
    title: 'Maya’s 21st Rooftop Neon Birthday',
    eventType: 'birthday',
    date: '2026-11-14',
    startTime: '18:00',
    durationHours: 5,
    guestCount: 45,
    totalBudget: 3500,
    currency: 'USD',
    location: 'Downtown Brooklyn Loft',
    theme: 'Cyberpunk Neon Glow & Mocktail Lounge',
    venueType: 'indoor',
    venueName: 'The Skyline Loft',
    dietaryRequirements: ['Vegetarian', 'Gluten-Free', 'Nut Allergy'],
    accessibilityRequirements: ['Wheelchair access'],
    mustHaveActivities: ['Glow Photobooth', 'Signature Cake Moment', 'DJ Dance Floor'],
    optionalFeatures: ['Custom Cocktail Stirrers', 'Late Night Taco Station'],
    priority: 'balanced',
    riskTolerance: 'moderate',
    contingencyPercentage: 12,
  };

  // Sample 2: University Tech & Cultural Fest
  const festReq: EventRequirements = {
    id: 'plan-sample-fest',
    title: 'InnovateX 2026: Campus Tech & Cultural Fest',
    eventType: 'college_festival',
    date: '2026-12-05',
    startTime: '10:00',
    durationHours: 8,
    guestCount: 350,
    totalBudget: 15000,
    currency: 'USD',
    location: 'North Campus Quad & Auditorium',
    theme: 'Future Horizons & Electro-Acoustic Beats',
    venueType: 'hybrid',
    venueName: 'University Central Grounds',
    dietaryRequirements: ['Halal', 'Vegetarian', 'Vegan'],
    accessibilityRequirements: ['Wheelchair ramps', 'ASL Interpreter for Keynote'],
    mustHaveActivities: ['Robotics Showcase', 'Battle of the Bands', 'Food Truck Alley'],
    optionalFeatures: ['Drone Light Show', 'Merch Booths'],
    priority: 'experience_first',
    riskTolerance: 'conservative',
    contingencyPercentage: 15,
  };

  // Sample 3: Grand Wedding & Reception Gala
  const weddingReq: EventRequirements = {
    id: 'plan-sample-wedding',
    title: 'Arjun & Priya’s Grand Wedding & Reception Gala',
    eventType: 'wedding',
    date: '2026-11-28',
    startTime: '17:00',
    durationHours: 6,
    guestCount: 180,
    totalBudget: 22000,
    currency: 'USD',
    location: 'Grand Botanical Conservatory, Seattle, WA',
    theme: 'Royal Emerald & Velvet Gold Elegance',
    venueType: 'indoor',
    venueName: 'The Conservatory Grand Ballroom',
    dietaryRequirements: ['Vegetarian', 'Jain Option', 'Gluten-Free', 'Nut Allergy Safe'],
    accessibilityRequirements: ['Step-Free / Wheelchair Ramps', 'Designated Accessible Parking'],
    mustHaveActivities: ['Traditional Ceremony', 'Sangeet Choreography', 'Royal Banquet Dinner', 'Cake & Champagne Toast'],
    optionalFeatures: ['Live Sitar Prelude', 'Custom Silk Keepsakes'],
    priority: 'experience_first',
    riskTolerance: 'conservative',
    contingencyPercentage: 12,
  };

  return [
    createPlanFromRequirements(bdayReq),
    createPlanFromRequirements(festReq),
    createPlanFromRequirements(weddingReq),
  ];
}

export function loadSavedPlans(): EventPlan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const samples = getSamplePlans();
      savePlans(samples);
      return samples;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : getSamplePlans();
  } catch (e) {
    console.warn('Failed to load plans from localStorage, using samples', e);
    return getSamplePlans();
  }
}

export function savePlans(plans: EventPlan[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  } catch (e) {
    console.error('Failed to save plans to localStorage', e);
  }
}

export function getActivePlanId(): string | null {
  return localStorage.getItem(ACTIVE_PLAN_KEY);
}

export function setActivePlanId(id: string): void {
  localStorage.setItem(ACTIVE_PLAN_KEY, id);
}
