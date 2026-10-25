import {
  EventRequirements,
  ExpenseCategory,
  ExpenseItem,
  BudgetBreakdown,
  CategoryAllocation,
  EventType,
} from '../types/event';

/**
 * Standard baseline category percentage distributions by Event Type
 */
const CATEGORY_DISTRIBUTIONS: Record<EventType, Record<ExpenseCategory, number>> = {
  birthday: {
    venue: 0.25,
    catering: 0.35,
    decor: 0.12,
    entertainment: 0.10,
    photography: 0.06,
    equipment: 0.02,
    contingency: 0.10,
    invitations: 0.02,
    miscellaneous: 0.03,
  },
  wedding: {
    venue: 0.28,
    catering: 0.32,
    decor: 0.14,
    entertainment: 0.08,
    photography: 0.10,
    equipment: 0.03,
    contingency: 0.10,
    invitations: 0.02,
    miscellaneous: 0.03,
  },
  college_festival: {
    venue: 0.15,
    catering: 0.15,
    decor: 0.10,
    entertainment: 0.30,
    equipment: 0.18,
    photography: 0.04,
    contingency: 0.10,
    invitations: 0.02,
    miscellaneous: 0.06,
  },
  family_gathering: {
    venue: 0.22,
    catering: 0.45,
    decor: 0.08,
    entertainment: 0.08,
    photography: 0.05,
    equipment: 0.02,
    contingency: 0.10,
    invitations: 0.02,
    miscellaneous: 0.03,
  },
  community_event: {
    venue: 0.20,
    catering: 0.25,
    decor: 0.10,
    entertainment: 0.15,
    equipment: 0.15,
    photography: 0.04,
    contingency: 0.10,
    invitations: 0.02,
    miscellaneous: 0.04,
  },
  corporate_social: {
    venue: 0.30,
    catering: 0.35,
    decor: 0.10,
    entertainment: 0.10,
    photography: 0.05,
    equipment: 0.04,
    contingency: 0.10,
    invitations: 0.01,
    miscellaneous: 0.05,
  },
  anniversary: {
    venue: 0.30,
    catering: 0.35,
    decor: 0.12,
    entertainment: 0.08,
    photography: 0.08,
    equipment: 0.02,
    contingency: 0.10,
    invitations: 0.02,
    miscellaneous: 0.03,
  },
};

export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  venue: 'Venue & Location',
  catering: 'Catering & Beverages',
  decor: 'Decor & Floral',
  entertainment: 'Music & Entertainment',
  photography: 'Photo & Video',
  equipment: 'Audio/Visual & Rentals',
  contingency: 'Safety Contingency',
  invitations: 'Invitations & Marketing',
  miscellaneous: 'Permits & Misc',
};

/**
 * Generates initial realistic expense items tailored to user requirements
 */
export function generateDefaultExpenses(requirements: EventRequirements): ExpenseItem[] {
  const { totalBudget, guestCount, eventType } = requirements;
  const dist = CATEGORY_DISTRIBUTIONS[eventType] || CATEGORY_DISTRIBUTIONS.birthday;
  const contingencyFactor = 1 - (requirements.contingencyPercentage || 10) / 100;

  const items: ExpenseItem[] = [
    {
      id: 'item-venue-rental',
      category: 'venue',
      name: `${requirements.venueType === 'outdoor' ? 'Park Pavilion / Outdoor Grounds' : 'Venue Hall Rental'} (${requirements.durationHours} hrs)`,
      estimatedCost: Math.round(totalBudget * contingencyFactor * (dist.venue * 0.85)),
      isEssential: true,
      notes: 'Includes standard tables and chairs',
      savingsAlternative: 'Negotiate an off-peak rate or select a community hall',
      potentialSavings: Math.round(totalBudget * contingencyFactor * (dist.venue * 0.25)),
    },
    {
      id: 'item-venue-cleanup',
      category: 'venue',
      name: 'Venue Cleaning & Damage Deposit reserve',
      estimatedCost: Math.round(totalBudget * contingencyFactor * (dist.venue * 0.15)),
      isEssential: true,
      notes: 'Required by venue contracts',
    },
    {
      id: 'item-catering-main',
      category: 'catering',
      name: `Buffet / Main Course (${guestCount} guests @ ~${Math.round((totalBudget * contingencyFactor * dist.catering * 0.7) / guestCount)}/guest)`,
      estimatedCost: Math.round(totalBudget * contingencyFactor * dist.catering * 0.7),
      isEssential: true,
      notes: `Must accommodate: ${requirements.dietaryRequirements.join(', ') || 'Standard dietary choices'}`,
      savingsAlternative: 'Shift from full-service plating to family-style or self-serve buffet',
      potentialSavings: Math.round(totalBudget * contingencyFactor * dist.catering * 0.18),
    },
    {
      id: 'item-catering-drinks',
      category: 'catering',
      name: 'Beverage & Refreshment Station',
      estimatedCost: Math.round(totalBudget * contingencyFactor * dist.catering * 0.2),
      isEssential: true,
      notes: 'Water, artisan sodas, iced tea, mocktails',
      savingsAlternative: 'Bulk self-serve drink dispensers instead of canned drinks',
      potentialSavings: Math.round(totalBudget * contingencyFactor * dist.catering * 0.08),
    },
    {
      id: 'item-catering-dessert',
      category: 'catering',
      name: eventType === 'birthday' ? 'Celebration Cake & Pastries' : 'Dessert & Fruit Display',
      estimatedCost: Math.round(totalBudget * contingencyFactor * dist.catering * 0.1),
      isEssential: false,
      notes: 'Custom celebration centerpiece dessert',
      savingsAlternative: 'Cupcake tower or sheet cake from a local artisan bakery',
      potentialSavings: Math.round(totalBudget * contingencyFactor * dist.catering * 0.04),
    },
    {
      id: 'item-decor-centerpieces',
      category: 'decor',
      name: 'Theme Ambience & Table Decor',
      estimatedCost: Math.round(totalBudget * contingencyFactor * dist.decor * 0.65),
      isEssential: false,
      notes: `Theme styling: "${requirements.theme || 'Festive Elegant'}"`,
      savingsAlternative: 'Rent reusable decor or assemble DIY floral/LED arrangements',
      potentialSavings: Math.round(totalBudget * contingencyFactor * dist.decor * 0.3),
    },
    {
      id: 'item-decor-signage',
      category: 'decor',
      name: 'Welcome Signage & Photo Backdrop',
      estimatedCost: Math.round(totalBudget * contingencyFactor * dist.decor * 0.35),
      isEssential: false,
      notes: 'Signage, lighting stringers, entrance easel',
    },
    {
      id: 'item-entertainment-music',
      category: 'entertainment',
      name: eventType === 'college_festival' ? 'Live Band / Headliner DJ' : 'Sound System / DJ Playlist Host',
      estimatedCost: Math.round(totalBudget * contingencyFactor * dist.entertainment * 0.75),
      isEssential: requirements.priority === 'experience_first',
      notes: 'Sound equipment and host coordination',
      savingsAlternative: 'Curated streaming playlist with premium rented Bluetooth PA system',
      potentialSavings: Math.round(totalBudget * contingencyFactor * dist.entertainment * 0.4),
    },
    {
      id: 'item-entertainment-activities',
      category: 'entertainment',
      name: 'Interactive Activities & Program Materials',
      estimatedCost: Math.round(totalBudget * contingencyFactor * dist.entertainment * 0.25),
      isEssential: false,
      notes: requirements.mustHaveActivities.join(', ') || 'Games, awards, trivia',
    },
    {
      id: 'item-photography-main',
      category: 'photography',
      name: 'Dedicated Event Photographer',
      estimatedCost: Math.round(totalBudget * contingencyFactor * dist.photography * 0.85),
      isEssential: false,
      notes: 'Coverage for key ceremonies & guest candids',
      savingsAlternative: 'Book 3 hours of peak coverage rather than all-day coverage',
      potentialSavings: Math.round(totalBudget * contingencyFactor * dist.photography * 0.35),
    },
    {
      id: 'item-equipment-av',
      category: 'equipment',
      name: 'Microphone & Projector / Lighting package',
      estimatedCost: Math.round(totalBudget * contingencyFactor * dist.equipment * 0.8),
      isEssential: requirements.mustHaveActivities.length > 0,
      notes: 'For speeches, announcements, background music',
    },
  ];

  return items;
}

/**
 * Deterministic recalculation of budget breakdown, pressure indicator, and category totals.
 */
export function calculateBudgetBreakdown(
  totalBudget: number,
  currency: EventRequirements['currency'],
  items: ExpenseItem[],
  contingencyPercentage: number = 10,
  eventType: EventType = 'birthday'
): BudgetBreakdown {
  const safeContingencyPct = Math.max(5, Math.min(30, contingencyPercentage));
  const contingencyReserve = Math.round(totalBudget * (safeContingencyPct / 100));

  // Compute total estimated costs from items
  const totalEstimatedCost = items.reduce((acc, item) => acc + (item.actualCost ?? item.estimatedCost), 0);
  const remainingBudget = totalBudget - totalEstimatedCost - contingencyReserve;
  const isOverBudget = remainingBudget < 0;
  const overBudgetAmount = isOverBudget ? Math.abs(remainingBudget) : 0;

  // Category totals
  const dist = CATEGORY_DISTRIBUTIONS[eventType] || CATEGORY_DISTRIBUTIONS.birthday;
  const categories: ExpenseCategory[] = [
    'venue',
    'catering',
    'decor',
    'entertainment',
    'photography',
    'equipment',
    'invitations',
    'miscellaneous',
  ];

  const categoryAllocations: CategoryAllocation[] = categories.map((cat) => {
    const pct = dist[cat] || 0.05;
    const allocatedBudget = Math.round(totalBudget * pct);
    const currentEstimatedTotal = items
      .filter((i) => i.category === cat)
      .reduce((acc, i) => acc + (i.actualCost ?? i.estimatedCost), 0);

    return {
      category: cat,
      allocatedBudget,
      percentage: Math.round(pct * 100),
      currentEstimatedTotal,
      description: CATEGORY_LABELS[cat] || cat,
    };
  });

  // Add contingency category
  categoryAllocations.push({
    category: 'contingency',
    allocatedBudget: contingencyReserve,
    percentage: safeContingencyPct,
    currentEstimatedTotal: contingencyReserve,
    description: 'Emergency Contingency Reserve',
  });

  // Calculate Budget Pressure Level & Explanations
  let budgetPressureLevel: 'healthy' | 'moderate' | 'critical' = 'healthy';
  let budgetPressureReason = '';

  const totalCommitted = totalEstimatedCost + contingencyReserve;
  const budgetUtilizationRatio = totalCommitted / (totalBudget || 1);
  const essentialCost = items.filter((i) => i.isEssential).reduce((sum, i) => sum + (i.actualCost ?? i.estimatedCost), 0);

  if (isOverBudget) {
    budgetPressureLevel = 'critical';
    budgetPressureReason = `Budget is exceeded by ${currency} ${overBudgetAmount.toLocaleString()}. Review optional expenses below to recover headroom.`;
  } else if (budgetUtilizationRatio > 0.95) {
    budgetPressureLevel = 'critical';
    budgetPressureReason = `High budget pressure: 95%+ of budget is committed. Buffer is dangerously slim for unforeseen costs.`;
  } else if (budgetUtilizationRatio > 0.85 || essentialCost > totalBudget * 0.8) {
    budgetPressureLevel = 'moderate';
    budgetPressureReason = `Moderate budget pressure: ${Math.round(budgetUtilizationRatio * 100)}% committed. Contingency is protected but upgrades should be paused.`;
  } else {
    budgetPressureLevel = 'healthy';
    budgetPressureReason = `Healthy budget margin: ${currency} ${remainingBudget.toLocaleString()} unallocated headroom available for surprises or luxury upgrades.`;
  }

  return {
    totalBudget,
    currency,
    contingencyReserve,
    contingencyPercentage: safeContingencyPct,
    categoryAllocations,
    items,
    totalEstimatedCost,
    remainingBudget,
    isOverBudget,
    overBudgetAmount,
    budgetPressureLevel,
    budgetPressureReason,
  };
}

/**
 * Calculates actionable savings opportunities prioritizing preserving essential items
 */
export function calculateSavingsOpportunities(budget: BudgetBreakdown): {
  totalPotentialSavings: number;
  recommendations: {
    itemId: string;
    itemName: string;
    category: ExpenseCategory;
    currentCost: number;
    potentialSavings: number;
    alternative: string;
    isEssential: boolean;
  }[];
} {
  const recommendations: {
    itemId: string;
    itemName: string;
    category: ExpenseCategory;
    currentCost: number;
    potentialSavings: number;
    alternative: string;
    isEssential: boolean;
  }[] = [];

  let totalPotentialSavings = 0;

  for (const item of budget.items) {
    if (item.savingsAlternative && item.potentialSavings && item.potentialSavings > 0) {
      recommendations.push({
        itemId: item.id,
        itemName: item.name,
        category: item.category,
        currentCost: item.actualCost ?? item.estimatedCost,
        potentialSavings: item.potentialSavings,
        alternative: item.savingsAlternative,
        isEssential: item.isEssential,
      });
      totalPotentialSavings += item.potentialSavings;
    }
  }

  // Sort optional items with highest savings first
  recommendations.sort((a, b) => {
    if (a.isEssential === b.isEssential) {
      return b.potentialSavings - a.potentialSavings;
    }
    return a.isEssential ? 1 : -1; // non-essential first
  });

  return {
    totalPotentialSavings,
    recommendations,
  };
}

/**
 * What-If Simulation: Calculates consequences of changing guest counts or total budget
 */
export function simulateWhatIf(
  currentBudget: BudgetBreakdown,
  guestCountCurrent: number,
  guestDelta: number,
  budgetDelta: number
) {
  const newGuestCount = Math.max(1, guestCountCurrent + guestDelta);
  const newTotalBudget = Math.max(100, currentBudget.totalBudget + budgetDelta);

  // Per-guest variable expenses (catering, invitations, drinks) scale linearly with guest count
  const guestRatio = newGuestCount / guestCountCurrent;

  let simulatedTotalCost = 0;
  for (const item of currentBudget.items) {
    const currentCost = item.actualCost ?? item.estimatedCost;
    if (item.category === 'catering' || item.category === 'invitations') {
      simulatedTotalCost += Math.round(currentCost * guestRatio);
    } else {
      // Fixed expenses like venue, DJ, photography stay relatively constant
      simulatedTotalCost += currentCost;
    }
  }

  const simulatedContingency = Math.round(newTotalBudget * (currentBudget.contingencyPercentage / 100));
  const simulatedRemaining = newTotalBudget - simulatedTotalCost - simulatedContingency;
  const simulatedPerGuestCost = Math.round(simulatedTotalCost / newGuestCount);

  let status: 'healthy' | 'tight' | 'exceeded' = 'healthy';
  if (simulatedRemaining < 0) {
    status = 'exceeded';
  } else if (simulatedRemaining < newTotalBudget * 0.1) {
    status = 'tight';
  }

  const tradeOffs: string[] = [];
  if (guestDelta > 0) {
    tradeOffs.push(`Adding ${guestDelta} guests increases catering by ~${currentBudget.currency} ${Math.round((simulatedTotalCost - currentBudget.totalEstimatedCost)).toLocaleString()}.`);
    if (status === 'exceeded') {
      tradeOffs.push(`Over budget by ${currentBudget.currency} ${Math.abs(simulatedRemaining).toLocaleString()}. Requires downgrading optional decor or entertainment.`);
    }
  } else if (guestDelta < 0) {
    tradeOffs.push(`Trimming ${Math.abs(guestDelta)} guests frees up ~${currentBudget.currency} ${Math.round(currentBudget.totalEstimatedCost - simulatedTotalCost).toLocaleString()} in variable costs.`);
  }

  if (budgetDelta < 0) {
    tradeOffs.push(`Reducing budget by ${currentBudget.currency} ${Math.abs(budgetDelta).toLocaleString()} tightens contingency buffer.`);
  } else if (budgetDelta > 0) {
    tradeOffs.push(`Increasing budget by ${currentBudget.currency} ${budgetDelta.toLocaleString()} creates room for photography or upgraded catering.`);
  }

  return {
    newGuestCount,
    newTotalBudget,
    simulatedTotalCost,
    simulatedPerGuestCost,
    simulatedRemaining,
    status,
    tradeOffs,
  };
}
