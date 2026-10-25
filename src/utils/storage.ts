import { EventPlan, EventRequirements } from '../types/event';
import { calculateBudgetBreakdown, generateDefaultExpenses } from './budgetEngine';
import { generateDefaultSchedule, detectScheduleConflicts, generateDefaultTasks } from './scheduleEngine';
import { analyzeRisks } from './riskEngine';
import { generateDemoVendors } from './vendorEngine';
import { calculatePlanCompleteness, generateRecommendations } from './completenessEngine';
import { generateDefaultChecklists } from './exportUtils';

const STORAGE_KEY = 'eventwise_saved_plans_v2';
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
 * Pre-seeded sample plan: Single realistic example for immediate exploration
 */
export function getSamplePlans(): EventPlan[] {
  // Single Polished Example: Grand Wedding & Reception Gala
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

  return [createPlanFromRequirements(weddingReq)];
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
