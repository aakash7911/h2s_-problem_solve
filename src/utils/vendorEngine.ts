import {
  EventRequirements,
  VendorItem,
  ExpenseCategory,
  BudgetBreakdown,
} from '../types/event';

export interface VendorWeights {
  price: number; // e.g. 0.35
  rating: number; // e.g. 0.25
  availability: number; // e.g. 0.20
  accessibility: number; // e.g. 0.10
  capacityFit: number; // e.g. 0.10
}

export const DEFAULT_VENDOR_WEIGHTS: VendorWeights = {
  price: 0.35,
  rating: 0.25,
  availability: 0.20,
  accessibility: 0.10,
  capacityFit: 0.10,
};

/**
 * Calculates a transparent, multi-criteria suitability score (0-100) for a vendor
 */
export function calculateVendorScore(
  vendor: Omit<VendorItem, 'suitabilityScore' | 'tradeOffSummary'>,
  categoryBudget: number,
  guestCount: number,
  hasAccessibilityNeeds: boolean,
  weights: VendorWeights = DEFAULT_VENDOR_WEIGHTS
): { score: number; tradeOffSummary: string } {
  // 1. Price Score: 100 if within or below budget; decreases proportionally if over budget
  let priceScore = 100;
  if (categoryBudget > 0) {
    if (vendor.estimatedPrice <= categoryBudget) {
      // Under budget: bonus up to 100
      const savingsPct = (categoryBudget - vendor.estimatedPrice) / categoryBudget;
      priceScore = Math.min(100, 80 + Math.round(savingsPct * 20));
    } else {
      const overPct = (vendor.estimatedPrice - categoryBudget) / categoryBudget;
      priceScore = Math.max(10, Math.round(100 - overPct * 120));
    }
  }

  // 2. Rating Score (1-5 scaled to 0-100)
  const ratingScore = Math.round((vendor.rating / 5) * 100);

  // 3. Availability Score
  const availMap: Record<VendorItem['availability'], number> = {
    high: 100,
    medium: 75,
    limited: 45,
    unconfirmed: 20,
  };
  const availabilityScore = availMap[vendor.availability] || 50;

  // 4. Accessibility Score
  let accessibilityScore = 70;
  if (hasAccessibilityNeeds) {
    accessibilityScore = vendor.accessibilitySupport ? 100 : 20;
  } else {
    accessibilityScore = vendor.accessibilitySupport ? 100 : 80;
  }

  // 5. Capacity Fit Score
  let capacityScore = 80;
  if (vendor.capacity) {
    if (vendor.capacity >= guestCount && vendor.capacity <= guestCount * 1.6) {
      capacityScore = 100; // Perfect fit
    } else if (vendor.capacity >= guestCount * 1.6) {
      capacityScore = 75; // Too large / potential wasted space
    } else {
      capacityScore = 20; // Under capacity!
    }
  }

  const rawScore =
    priceScore * weights.price +
    ratingScore * weights.rating +
    availabilityScore * weights.availability +
    accessibilityScore * weights.accessibility +
    capacityScore * weights.capacityFit;

  const score = Math.round(Math.max(0, Math.min(100, rawScore)));

  // Generate transparent trade-off summary
  let tradeOffSummary = '';
  if (priceScore >= 80 && ratingScore >= 80) {
    tradeOffSummary = 'High value: competitive pricing combined with top-tier satisfaction ratings.';
  } else if (priceScore < 60 && ratingScore >= 80) {
    tradeOffSummary = 'Premium tier: higher investment cost, but provides elite reliability and quality.';
  } else if (priceScore >= 90 && ratingScore < 70) {
    tradeOffSummary = 'Budget-friendly option: significant cost savings, but may require closer coordination.';
  } else if (vendor.availability === 'limited') {
    tradeOffSummary = 'High demand: slots are limited; booking immediately is necessary to avoid loss.';
  } else {
    tradeOffSummary = 'Balanced profile with moderate pricing and standard service expectations.';
  }

  return { score, tradeOffSummary };
}

/**
 * Generates initial demonstration vendor records (explicitly flagged as demo records)
 */
export function generateDemoVendors(
  requirements: EventRequirements,
  budget: BudgetBreakdown
): VendorItem[] {
  const getCatBudget = (cat: ExpenseCategory) => {
    const alloc = budget.categoryAllocations.find((a) => a.category === cat);
    return alloc ? alloc.allocatedBudget : Math.round(budget.totalBudget * 0.2);
  };

  const hasAccessNeeds = requirements.accessibilityRequirements.length > 0;
  const guestCount = requirements.guestCount;

  const demoRaw: Omit<VendorItem, 'suitabilityScore' | 'tradeOffSummary'>[] = [
    // Venue options
    {
      id: 'vendor-venue-1',
      category: 'venue',
      name: `${requirements.location || 'Metro'} Grand Civic Center [DEMO]`,
      isDemoRecord: true,
      contactEmail: 'events@demociviccenter.test',
      estimatedPrice: Math.round(getCatBudget('venue') * 0.9),
      capacity: Math.round(guestCount * 1.3),
      availability: 'high',
      rating: 4.8,
      accessibilitySupport: true,
      pros: ['Full ADA compliant step-free access', 'Included audio/visual setup', 'Ample onsite parking'],
      cons: ['Strict 11 PM noise curfew', 'Must use approved vendor list for alcohol'],
      selected: true,
    },
    {
      id: 'vendor-venue-2',
      category: 'venue',
      name: `Artisan Loft & Rooftop Terrace [DEMO]`,
      isDemoRecord: true,
      contactEmail: 'booking@demorooftoploft.test',
      estimatedPrice: Math.round(getCatBudget('venue') * 1.25),
      capacity: Math.round(guestCount * 1.1),
      availability: 'limited',
      rating: 4.9,
      accessibilitySupport: false,
      pros: ['Spectacular skyline panoramic view', 'Industrial chic design requires minimal decor', 'Flexible catering rules'],
      cons: ['Elevator is small freight-only', '25% over average category allocation', 'Weather dependent outdoor area'],
      selected: false,
    },
    {
      id: 'vendor-venue-3',
      category: 'venue',
      name: `Community Green Pavilion [DEMO]`,
      isDemoRecord: true,
      contactEmail: 'parks@democommunity.test',
      estimatedPrice: Math.round(getCatBudget('venue') * 0.5),
      capacity: Math.round(guestCount * 1.8),
      availability: 'high',
      rating: 4.2,
      accessibilitySupport: true,
      pros: ['Highly affordable rate saves ~50%', 'Expansive outdoor lawn space', 'Open vendor policies'],
      cons: ['Must rent external portable restrooms', 'No built-in sound system'],
      selected: false,
    },

    // Catering options
    {
      id: 'vendor-cat-1',
      category: 'catering',
      name: `Epicurean Feast Catering Co. [DEMO]`,
      isDemoRecord: true,
      contactEmail: 'tasting@demoepicurean.test',
      estimatedPrice: Math.round(getCatBudget('catering') * 0.95),
      capacity: guestCount * 2,
      availability: 'high',
      rating: 4.9,
      accessibilitySupport: true,
      pros: ['Dedicated allergen prep kitchen', 'Complimentary table linens & cutlery', 'High chef-to-guest ratio'],
      cons: ['Requires 14-day final headcount lock', 'Deposit non-refundable after 30 days'],
      selected: true,
    },
    {
      id: 'vendor-cat-2',
      category: 'catering',
      name: `Street Gourmet Food Trucks Coalition [DEMO]`,
      isDemoRecord: true,
      contactEmail: 'trucks@demogourmet.test',
      estimatedPrice: Math.round(getCatBudget('catering') * 0.75),
      capacity: guestCount * 3,
      availability: 'medium',
      rating: 4.6,
      accessibilitySupport: true,
      pros: ['Casual lively vibe guests love', 'Interactive made-to-order stations', '25% lower overall cost'],
      cons: ['Queue times during peak hour', 'Outdoor parking permit required'],
      selected: false,
    },

    // Entertainment options
    {
      id: 'vendor-ent-1',
      category: 'entertainment',
      name: `SoundWave Entertainment & Lighting [DEMO]`,
      isDemoRecord: true,
      contactEmail: 'info@demosoundwave.test',
      estimatedPrice: Math.round(getCatBudget('entertainment') * 0.85),
      availability: 'high',
      rating: 4.8,
      accessibilitySupport: true,
      pros: ['Includes wireless microphones & dance wash lighting', 'Experienced emcee handles schedule transitions'],
      cons: ['High bass volume requires indoor sound damping', '3-hour minimum booking'],
      selected: true,
    },

    // Photography options
    {
      id: 'vendor-photo-1',
      category: 'photography',
      name: `Lumina Documentary Photo & Film [DEMO]`,
      isDemoRecord: true,
      contactEmail: 'studio@demolumina.test',
      estimatedPrice: Math.round(getCatBudget('photography') * 0.9),
      availability: 'medium',
      rating: 4.9,
      accessibilitySupport: true,
      pros: ['Digital online gallery delivered in 5 business days', 'Second shooter included during key speeches'],
      cons: ['Overtime billed at $150/hr', 'Print album not included in base tier'],
      selected: true,
    },
  ];

  return demoRaw.map((v) => {
    const { score, tradeOffSummary } = calculateVendorScore(
      v,
      getCatBudget(v.category),
      guestCount,
      hasAccessNeeds
    );
    return {
      ...v,
      suitabilityScore: score,
      tradeOffSummary,
    };
  });
}
