import { describe, it, expect } from 'vitest';
import {
  calculateBudgetBreakdown,
  generateDefaultExpenses,
  calculateSavingsOpportunities,
  simulateWhatIf,
} from '../utils/budgetEngine';
import { EventRequirements, ExpenseItem } from '../types/event';

describe('Budget Engine & Arithmetic Intelligence', () => {
  const mockReq: EventRequirements = {
    id: 'test-event-1',
    title: 'Sarah’s Graduation Dinner',
    eventType: 'birthday',
    date: '2026-11-20',
    startTime: '19:00',
    durationHours: 4,
    guestCount: 50,
    totalBudget: 5000,
    currency: 'USD',
    location: 'Downtown Hall',
    theme: 'Golden Hour Elegance',
    venueType: 'indoor',
    dietaryRequirements: ['Vegetarian'],
    accessibilityRequirements: [],
    mustHaveActivities: ['Toasts'],
    optionalFeatures: [],
    priority: 'balanced',
    riskTolerance: 'moderate',
    contingencyPercentage: 10,
  };

  it('correctly calculates contingency reserve and remaining budget when healthy', () => {
    const items: ExpenseItem[] = [
      { id: '1', category: 'venue', name: 'Hall Rental', estimatedCost: 1200, isEssential: true },
      { id: '2', category: 'catering', name: 'Buffet', estimatedCost: 1500, isEssential: true },
      { id: '3', category: 'decor', name: 'Flowers', estimatedCost: 500, isEssential: false },
    ];

    const breakdown = calculateBudgetBreakdown(5000, 'USD', items, 10, 'birthday');

    // Contingency: 10% of 5000 = 500
    expect(breakdown.contingencyReserve).toBe(500);
    // Estimated Cost: 1200 + 1500 + 500 = 3200
    expect(breakdown.totalEstimatedCost).toBe(3200);
    // Remaining Budget: 5000 - 3200 - 500 = 1300
    expect(breakdown.remainingBudget).toBe(1300);
    expect(breakdown.isOverBudget).toBe(false);
    expect(breakdown.overBudgetAmount).toBe(0);
    expect(breakdown.budgetPressureLevel).toBe('healthy');
  });

  it('identifies overspending and triggers critical budget pressure alert', () => {
    const items: ExpenseItem[] = [
      { id: '1', category: 'venue', name: 'Expensive Hall', estimatedCost: 3000, isEssential: true },
      { id: '2', category: 'catering', name: 'Gourmet Catering', estimatedCost: 2500, isEssential: true },
    ];

    // Total cost 5500 + 500 contingency = 6000 committed against 5000 budget
    const breakdown = calculateBudgetBreakdown(5000, 'USD', items, 10, 'birthday');

    expect(breakdown.isOverBudget).toBe(true);
    expect(breakdown.overBudgetAmount).toBe(1000); // 5000 - 5500 - 500 = -1000
    expect(breakdown.budgetPressureLevel).toBe('critical');
    expect(breakdown.budgetPressureReason).toContain('exceeded');
  });

  it('generates default expenses matching total budget distribution', () => {
    const defaultExpenses = generateDefaultExpenses(mockReq);
    expect(defaultExpenses.length).toBeGreaterThan(5);

    const totalEstimated = defaultExpenses.reduce((sum, item) => sum + item.estimatedCost, 0);
    // Default items + 10% contingency should be around total budget
    expect(totalEstimated).toBeLessThanOrEqual(mockReq.totalBudget);
    expect(defaultExpenses.some((i) => i.isEssential)).toBe(true);
  });

  it('prioritizes savings opportunities on non-essential items first', () => {
    const items: ExpenseItem[] = [
      {
        id: '1',
        category: 'decor',
        name: 'Grand Floral Arch',
        estimatedCost: 800,
        isEssential: false,
        savingsAlternative: 'Rent silk flower arch',
        potentialSavings: 500,
      },
      {
        id: '2',
        category: 'venue',
        name: 'Main Ballroom',
        estimatedCost: 2000,
        isEssential: true,
        savingsAlternative: 'Community hall',
        potentialSavings: 600,
      },
    ];

    const breakdown = calculateBudgetBreakdown(5000, 'USD', items, 10);
    const savings = calculateSavingsOpportunities(breakdown);

    expect(savings.totalPotentialSavings).toBe(1100);
    expect(savings.recommendations.length).toBe(2);
    // Non-essential item should be ranked first to protect essential venue
    expect(savings.recommendations[0].isEssential).toBe(false);
    expect(savings.recommendations[0].itemId).toBe('1');
  });

  it('correctly simulates what-if scenarios when guest count or budget scales', () => {
    const items: ExpenseItem[] = [
      { id: '1', category: 'catering', name: 'Per-Head Dining', estimatedCost: 2000, isEssential: true },
      { id: '2', category: 'venue', name: 'Fixed Venue Rate', estimatedCost: 1500, isEssential: true },
    ];

    const breakdown = calculateBudgetBreakdown(4000, 'USD', items, 10);

    // Scenario: +50 guests (doubling from 50 to 100)
    const simulation = simulateWhatIf(breakdown, 50, 50, 0);

    expect(simulation.newGuestCount).toBe(100);
    // Catering doubled from 2000 to 4000; venue stayed 1500. Total = 5500
    expect(simulation.simulatedTotalCost).toBe(5500);
    expect(simulation.status).toBe('exceeded');
    expect(simulation.tradeOffs.length).toBeGreaterThan(0);
  });
});
