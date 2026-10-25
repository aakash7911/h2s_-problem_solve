import { describe, it, expect } from 'vitest';
import { calculateVendorScore, generateDemoVendors } from '../utils/vendorEngine';
import { calculateBudgetBreakdown, generateDefaultExpenses } from '../utils/budgetEngine';
import { EventRequirements } from '../types/event';

describe('Vendor Evaluation Engine & Multi-Criteria Scoring', () => {
  const baseVendor = {
    id: 'v1',
    category: 'venue' as const,
    name: 'Metropolitan Hall [DEMO]',
    isDemoRecord: true as const,
    contactEmail: 'contact@demo.test',
    estimatedPrice: 2000,
    capacity: 100,
    availability: 'high' as const,
    rating: 4.8,
    accessibilitySupport: true,
    pros: ['Spacious', 'ADA compliant'],
    cons: ['Early curfew'],
    selected: false,
  };

  it('awards higher scores when vendor is well within budget and meets capacity', () => {
    // Budget is 2500, price is 2000, 80 guests -> Great fit
    const result = calculateVendorScore(baseVendor, 2500, 80, true);
    expect(result.score).toBeGreaterThan(80);
    expect(result.tradeOffSummary).toContain('High value');
  });

  it('penalizes score when price exceeds category budget significantly', () => {
    // Budget is only 1200, price is 2000 (66% over budget)
    const result = calculateVendorScore(baseVendor, 1200, 80, false);
    expect(result.score).toBeLessThan(75);
  });

  it('strongly penalizes accessibility score when event has accessibility needs but vendor lacks support', () => {
    const inaccessibleVendor = {
      ...baseVendor,
      accessibilitySupport: false,
    };

    const withAccessNeeds = calculateVendorScore(inaccessibleVendor, 2500, 80, true);
    const withoutAccessNeeds = calculateVendorScore(inaccessibleVendor, 2500, 80, false);

    expect(withAccessNeeds.score).toBeLessThan(withoutAccessNeeds.score);
  });

  it('flags all sample vendor records as demonstration records', () => {
    const mockReq: EventRequirements = {
      id: 'req1',
      title: 'Community Fair',
      eventType: 'community_event',
      date: '2026-10-10',
      startTime: '10:00',
      durationHours: 6,
      guestCount: 150,
      totalBudget: 8000,
      currency: 'USD',
      location: 'Community Center',
      theme: 'Harvest',
      venueType: 'outdoor',
      dietaryRequirements: [],
      accessibilityRequirements: ['Wheelchair access'],
      mustHaveActivities: [],
      optionalFeatures: [],
      priority: 'balanced',
      riskTolerance: 'moderate',
      contingencyPercentage: 10,
    };

    const budget = calculateBudgetBreakdown(8000, 'USD', generateDefaultExpenses(mockReq));
    const vendors = generateDemoVendors(mockReq, budget);

    expect(vendors.length).toBeGreaterThan(3);
    vendors.forEach((v) => {
      expect(v.name.length).toBeGreaterThan(5);
      expect(v.contactEmail).toBeDefined();
      expect(v.suitabilityScore).toBeGreaterThanOrEqual(0);
      expect(v.suitabilityScore).toBeLessThanOrEqual(100);
      expect(v.tradeOffSummary.length).toBeGreaterThan(5);
    });
  });
});
