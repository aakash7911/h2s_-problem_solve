import { describe, it, expect } from 'vitest';
import { DeterministicAdapter } from '../../server/adapters/deterministicAdapter';
import { GeminiAdapter } from '../../server/adapters/geminiAdapter';
import { createPlanFromRequirements } from '../utils/storage';
import { EventRequirements } from '../types/event';

describe('Input Validation, AI Adapter & Error Resilience', () => {
  const baseReq: EventRequirements = {
    id: 'plan-valid-1',
    title: 'Community Arts Gala',
    eventType: 'community_event',
    date: '2026-10-30',
    startTime: '17:00',
    durationHours: 5,
    guestCount: 120,
    totalBudget: 7500,
    currency: 'USD',
    location: 'Civic Plaza',
    theme: 'Autumn Splendor',
    venueType: 'outdoor',
    dietaryRequirements: ['Gluten-Free'],
    accessibilityRequirements: ['Wheelchair access'],
    mustHaveActivities: ['Artisan Market', 'Live Acoustic Trio'],
    optionalFeatures: ['Cider Press Station'],
    priority: 'balanced',
    riskTolerance: 'conservative',
    contingencyPercentage: 10,
  };

  it('validates requirements and generates fallback plan when AI key is missing', async () => {
    // Unconfigured Gemini adapter should gracefully fall back to deterministic engine
    const geminiAdapter = new GeminiAdapter('your_gemini_api_key_here');
    expect(geminiAdapter.isConfigured()).toBe(false);

    const result = await geminiAdapter.generatePlanCreative(baseReq);
    expect(result.isLiveAI).toBe(false);
    expect(result.provider).toBe('deterministic_engine');
    expect(result.conceptRationale.themeConcept).toBeDefined();
    expect(result.creativeRecommendations.length).toBeGreaterThan(0);
    expect(result.notice).toContain('Deterministic Planning Engine');
  });

  it('deterministic adapter produces rich structured creative rationales for all event types', async () => {
    const adapter = new DeterministicAdapter();
    expect(adapter.isConfigured()).toBe(true);

    const eventTypes: EventRequirements['eventType'][] = [
      'birthday',
      'wedding',
      'college_festival',
      'family_gathering',
      'community_event',
    ];

    for (const evt of eventTypes) {
      const res = await adapter.generatePlanCreative({ ...baseReq, eventType: evt });
      expect(res.conceptRationale.themeConcept).toContain(baseReq.theme);
      expect(res.conceptRationale.atmosphereDescription.length).toBeGreaterThan(15);
      expect(res.conceptRationale.keySuccessFactors.length).toBe(3);
    }
  });

  it('creates complete plan from requirements with all modules synchronized', () => {
    const plan = createPlanFromRequirements(baseReq);

    expect(plan.id).toBe(baseReq.id);
    expect(plan.requirements.guestCount).toBe(120);
    expect(plan.budget.totalBudget).toBe(7500);
    expect(plan.budget.remainingBudget).toBeGreaterThanOrEqual(0);
    expect(plan.schedule.length).toBeGreaterThan(3);
    expect(plan.vendors.length).toBeGreaterThan(3);
    expect(plan.risks.length).toBeGreaterThan(2);
    expect(plan.checklists.length).toBe(4);
    expect(plan.completeness.score).toBeGreaterThan(70);
  });
});
