import { describe, it, expect } from 'vitest';
import { calculatePlanCompleteness, generateRecommendations } from '../utils/completenessEngine';
import { calculateBudgetBreakdown, generateDefaultExpenses } from '../utils/budgetEngine';
import { generateDefaultSchedule, detectScheduleConflicts, generateDefaultTasks } from '../utils/scheduleEngine';
import { analyzeRisks } from '../utils/riskEngine';
import { EventRequirements } from '../types/event';

describe('Plan Completeness & Explainable Recommendations Engine', () => {
  const completeReq: EventRequirements = {
    id: 'req-full',
    title: 'Emerald Gala Celebration',
    eventType: 'corporate_social',
    date: '2026-12-15',
    startTime: '18:30',
    durationHours: 4,
    guestCount: 80,
    totalBudget: 12000,
    currency: 'USD',
    location: 'Emerald Ballroom, Seattle',
    theme: 'Midnight Velvet',
    venueType: 'indoor',
    dietaryRequirements: ['Vegetarian', 'Gluten-Free'],
    accessibilityRequirements: ['Wheelchair access'],
    mustHaveActivities: ['CEO Toast', 'Award Presentation'],
    optionalFeatures: ['Champagne Fountain'],
    priority: 'balanced',
    riskTolerance: 'conservative',
    contingencyPercentage: 12,
  };

  it('calculates high completeness score for well-formed plans with contingency and schedule integrity', () => {
    const budget = calculateBudgetBreakdown(12000, 'USD', generateDefaultExpenses(completeReq), 12);
    const schedule = generateDefaultSchedule(completeReq);
    const conflicts = detectScheduleConflicts(schedule, completeReq.startTime, completeReq.durationHours);
    const tasks = generateDefaultTasks(completeReq);
    const risks = analyzeRisks(completeReq, budget);

    const completeness = calculatePlanCompleteness(completeReq, budget, conflicts, tasks, risks);

    expect(completeness.score).toBeGreaterThanOrEqual(80);
    expect(completeness.breakdown.budgetBalanced).toBe(true);
    expect(completeness.breakdown.contingencyFunded).toBe(true);
    expect(completeness.breakdown.scheduleConflictFree).toBe(true);
  });

  it('penalizes completeness when budget is overspent or schedule has conflicts', () => {
    const budget = calculateBudgetBreakdown(
      5000,
      'USD',
      [
        { id: '1', category: 'venue', name: 'Expensive', estimatedCost: 6000, isEssential: true },
      ],
      5
    );
    const mockConflicts = [
      {
        id: 'c1',
        type: 'overlap' as const,
        severity: 'high' as const,
        itemIds: ['1', '2'],
        description: 'Collision',
        recommendedFix: 'Shift time',
      },
    ];

    const incompleteReq: EventRequirements = {
      ...completeReq,
      location: '', // Missing location
      totalBudget: 5000,
    };

    const completeness = calculatePlanCompleteness(incompleteReq, budget, mockConflicts, [], []);

    expect(completeness.score).toBeLessThan(60);
    expect(completeness.breakdown.budgetBalanced).toBe(false);
    expect(completeness.missingItems.length).toBeGreaterThan(0);
    expect(completeness.suggestedNextSteps.length).toBeGreaterThan(0);
  });

  it('distinguishes origin types (user_fact vs calculated_estimate vs ai_suggestion) in recommendations', () => {
    const budget = calculateBudgetBreakdown(12000, 'USD', generateDefaultExpenses(completeReq), 12);
    const recs = generateRecommendations(completeReq, budget);

    expect(recs.length).toBeGreaterThan(2);

    const hasUserFact = recs.some((r) => r.originType === 'user_fact');
    const hasCalculated = recs.some((r) => r.originType === 'calculated_estimate');
    const hasAiSuggestion = recs.some((r) => r.originType === 'ai_suggestion');

    expect(hasUserFact).toBe(true);
    expect(hasCalculated).toBe(true);
    expect(hasAiSuggestion).toBe(true);

    recs.forEach((r) => {
      expect(r.rationale.length).toBeGreaterThan(5);
      expect(r.impact.length).toBeGreaterThan(5);
    });
  });
});
