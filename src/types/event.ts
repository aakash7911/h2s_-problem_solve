// EventWise AI - Core Data Models

export type EventType =
  | 'birthday'
  | 'wedding'
  | 'college_festival'
  | 'family_gathering'
  | 'community_event'
  | 'corporate_social'
  | 'anniversary';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'INR' | 'CAD' | 'AUD';

export type PlanningPriority = 'balanced' | 'budget_strict' | 'experience_first' | 'stress_free';

export type RiskTolerance = 'conservative' | 'moderate' | 'flexible';

export type VenueType = 'indoor' | 'outdoor' | 'hybrid' | 'undecided';

export interface EventRequirements {
  id: string;
  title: string;
  eventType: EventType;
  date: string; // ISO date string YYYY-MM-DD
  startTime: string; // HH:mm format
  durationHours: number;
  guestCount: number;
  totalBudget: number;
  currency: Currency;
  location: string;
  theme: string;
  venueType: VenueType;
  venueName?: string;
  dietaryRequirements: string[]; // e.g., ['Vegetarian', 'Gluten-Free', 'Halal', 'Nut Allergy']
  accessibilityRequirements: string[]; // e.g., ['Wheelchair access', 'Ground floor', 'Hearing loop']
  mustHaveActivities: string[];
  optionalFeatures: string[];
  priority: PlanningPriority;
  riskTolerance: RiskTolerance;
  notes?: string;
  contingencyPercentage: number; // default 10-15%
}

export type ExpenseCategory =
  | 'venue'
  | 'catering'
  | 'decor'
  | 'entertainment'
  | 'photography'
  | 'equipment'
  | 'contingency'
  | 'invitations'
  | 'miscellaneous';

export interface ExpenseItem {
  id: string;
  category: ExpenseCategory;
  name: string;
  estimatedCost: number;
  actualCost?: number;
  isEssential: boolean; // Essential expenses are protected before optional upgrades
  notes?: string;
  savingsAlternative?: string; // Realistic alternative to cut costs
  potentialSavings?: number;
}

export interface CategoryAllocation {
  category: ExpenseCategory;
  allocatedBudget: number;
  percentage: number;
  currentEstimatedTotal: number;
  description: string;
}

export interface BudgetBreakdown {
  totalBudget: number;
  currency: Currency;
  contingencyReserve: number;
  contingencyPercentage: number;
  categoryAllocations: CategoryAllocation[];
  items: ExpenseItem[];
  totalEstimatedCost: number;
  remainingBudget: number;
  isOverBudget: boolean;
  overBudgetAmount: number;
  budgetPressureLevel: 'healthy' | 'moderate' | 'critical'; // Based on remaining % and essential ratio
  budgetPressureReason: string;
}

export interface ScheduleItem {
  id: string;
  title: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationMinutes: number;
  description: string;
  location?: string;
  responsibleParty?: string;
  dependencies?: string[]; // IDs of schedule items that must occur before
  isSetupCleanup?: boolean;
}

export interface ScheduleConflict {
  id: string;
  type: 'overlap' | 'dependency_violation' | 'duration_exceeded' | 'missing_setup';
  severity: 'high' | 'medium' | 'low';
  itemIds: string[];
  description: string;
  recommendedFix: string;
}

export interface TaskItem {
  id: string;
  title: string;
  category: ExpenseCategory | 'logistics' | 'coordination';
  deadlineDate: string; // ISO date
  isCompleted: boolean;
  priority: 'high' | 'medium' | 'low';
  assignedTo?: string;
  notes?: string;
  dependentTaskId?: string;
}

export interface VendorItem {
  id: string;
  category: ExpenseCategory;
  name: string;
  isDemoRecord: true; // Always true to never fabricate real quotes
  contactEmail?: string;
  estimatedPrice: number;
  capacity?: number;
  availability: 'high' | 'medium' | 'limited' | 'unconfirmed';
  rating: number; // 1-5 scale
  suitabilityScore: number; // 0-100 calculated
  accessibilitySupport: boolean;
  pros: string[];
  cons: string[];
  tradeOffSummary: string;
  selected: boolean;
}

export interface RiskItem {
  id: string;
  category: 'weather' | 'budget' | 'vendor' | 'schedule' | 'dietary' | 'accessibility';
  title: string;
  probability: 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
  riskScore: number; // calculated 1-9
  description: string;
  contingencyPlan: string;
  actionRequired: string;
  isOutdoorRelated?: boolean;
}

export interface RecommendationItem {
  id: string;
  category: string;
  title: string;
  recommendation: string;
  rationale: string; // "Why this was suggested"
  originType: 'user_fact' | 'calculated_estimate' | 'ai_suggestion';
  impact: string;
}

export interface ChecklistSection {
  title: string;
  items: {
    id: string;
    text: string;
    completed: boolean;
    importance: 'essential' | 'recommended' | 'optional';
  }[];
}

export interface PlanCompleteness {
  score: number; // 0 - 100
  level: 'preliminary' | 'in_progress' | 'ready' | 'comprehensive';
  breakdown: {
    basicDetailsCompleted: boolean;
    budgetBalanced: boolean;
    contingencyFunded: boolean;
    scheduleConflictFree: boolean;
    tasksDefined: boolean;
    dietaryHandled: boolean;
    weatherContingencyReady: boolean;
  };
  missingItems: string[];
  suggestedNextSteps: string[];
}

export interface WhatIfScenario {
  id: string;
  name: string;
  guestCountDelta: number; // e.g. +20 or -15
  budgetDelta: number; // e.g. -500 or +1000
  simulatedTotalCost: number;
  simulatedPerGuestCost: number;
  budgetStatus: 'healthy' | 'tight' | 'exceeded';
  summary: string;
  tradeOffs: string[];
}

export interface EventPlan {
  id: string;
  createdAt: string;
  updatedAt: string;
  isAIGenerated: boolean;
  aiProviderUsed?: 'gemini' | 'openai' | 'deterministic_engine';
  requirements: EventRequirements;
  conceptRationale: {
    themeConcept: string;
    atmosphereDescription: string;
    targetAudienceFit: string;
    keySuccessFactors: string[];
  };
  budget: BudgetBreakdown;
  schedule: ScheduleItem[];
  scheduleConflicts: ScheduleConflict[];
  tasks: TaskItem[];
  checklists: ChecklistSection[];
  vendors: VendorItem[];
  risks: RiskItem[];
  recommendations: RecommendationItem[];
  completeness: PlanCompleteness;
  changeHistory?: {
    timestamp: string;
    description: string;
    impactSummary: string;
  }[];
}
