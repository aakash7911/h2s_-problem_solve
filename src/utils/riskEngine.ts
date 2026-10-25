import { EventRequirements, RiskItem, BudgetBreakdown } from '../types/event';

export function analyzeRisks(requirements: EventRequirements, budget: BudgetBreakdown): RiskItem[] {
  const risks: RiskItem[] = [];

  // 1. Weather Risk (Outdoor or Hybrid venues)
  if (requirements.venueType === 'outdoor' || requirements.venueType === 'hybrid') {
    risks.push({
      id: 'risk-weather-rain',
      category: 'weather',
      title: 'Inclement Weather & Outdoor Precipitation',
      probability: 'high',
      impact: 'high',
      riskScore: 9,
      description: 'Outdoor setting makes activities and AV equipment susceptible to rain, strong gusts, or extreme heat/cold.',
      contingencyPlan: 'Reserve waterproof marquee canopy or confirm nearby indoor hall transfer option 72h prior. Cover electronic gear in protective vinyl.',
      actionRequired: 'Inspect venue policy on bad-weather cancellation and establish a 48-hour call threshold.',
      isOutdoorRelated: true,
    });

    risks.push({
      id: 'risk-outdoor-power',
      category: 'weather',
      title: 'Outdoor Power Supply & Surge Hazards',
      probability: 'medium',
      impact: 'medium',
      riskScore: 5,
      description: 'Outdoor outlets may trip under heavy DJ/catering wattage or short-circuit in moisture.',
      contingencyPlan: 'Hire a portable silent generator (min 5kVA) and heavy-duty weatherproof extension cords with GFCI protection.',
      actionRequired: 'Verify power wattage limits with the venue manager.',
      isOutdoorRelated: true,
    });
  }

  // 2. Budget Overrun Risk
  if (budget.budgetPressureLevel === 'critical' || budget.isOverBudget) {
    risks.push({
      id: 'risk-budget-deficit',
      category: 'budget',
      title: 'Unbudgeted Incidentals & Cost Overrun',
      probability: 'high',
      impact: 'high',
      riskScore: 8,
      description: `Current commitments exceed or sit dangerously close to budget ceiling. Additional vendor taxes or tips will cause debt.`,
      contingencyPlan: `Immediately convert non-essential line items (${budget.currency} ${budget.overBudgetAmount || 500}) to lower-tier DIY alternatives.`,
      actionRequired: 'Enforce strict spending cap on decorations and discretionary party favors.',
    });
  } else {
    risks.push({
      id: 'risk-budget-hidden-fees',
      category: 'budget',
      title: 'Hidden Vendor Surcharges & Gratuities',
      probability: 'medium',
      impact: 'medium',
      riskScore: 4,
      description: 'Caterers and venues commonly levy 18-22% service charges, corkage fees, and clean-up surcharges.',
      contingencyPlan: `Guarded by your ${budget.contingencyPercentage}% contingency fund (${budget.currency} ${budget.contingencyReserve.toLocaleString()}).`,
      actionRequired: 'Ask all vendors for all-inclusive "out-the-door" written quotes before signing.',
    });
  }

  // 3. Dietary & Allergen Safety Risk
  if (requirements.dietaryRequirements && requirements.dietaryRequirements.length > 0) {
    risks.push({
      id: 'risk-dietary-cross-contamination',
      category: 'dietary',
      title: 'Food Cross-Contamination & Allergen Exposure',
      probability: 'medium',
      impact: 'high',
      riskScore: 7,
      description: `Event includes guests with specific restrictions (${requirements.dietaryRequirements.join(', ')}). Accidental cross-contamination can cause health emergencies.`,
      contingencyPlan: 'Require caterer to label each platter with allergen flags and prepare separate sealed boxes for severe allergies.',
      actionRequired: 'Obtain written allergen confirmation from catering kitchen head 5 days prior.',
    });
  }

  // 4. Accessibility Barrier Risk
  if (requirements.accessibilityRequirements && requirements.accessibilityRequirements.length > 0) {
    risks.push({
      id: 'risk-accessibility-barriers',
      category: 'accessibility',
      title: 'Venue Physical Access Impediments',
      probability: 'medium',
      impact: 'high',
      riskScore: 6,
      description: `Specific accessibility needs specified (${requirements.accessibilityRequirements.join(', ')}). Stairs, narrow doorways, or uneven gravel will exclude attendees.`,
      contingencyPlan: 'Designate step-free arrival pathways, reserve front-row seating, and ensure accessible restroom is unlocked and unblocked.',
      actionRequired: 'Conduct in-person walkthrough or photo verification of all entrances and ramps.',
    });
  }

  // 5. Vendor Delay or No-Show Risk
  risks.push({
    id: 'risk-vendor-delay',
    category: 'vendor',
    title: 'Critical Vendor Delay (Catering / DJ)',
    probability: 'low',
    impact: 'high',
    riskScore: 5,
    description: 'Traffic congestion or double-booking can cause key vendor delays during initial reception.',
    contingencyPlan: 'Require all vendors to arrive 60-90 minutes prior to scheduled start. Keep curated Spotify backup playlist on an iPad with auxiliary cable.',
    actionRequired: 'Store direct cell phone numbers of on-site vendor drivers in coordinator phone.',
  });

  // Sort by risk score descending
  return risks.sort((a, b) => b.riskScore - a.riskScore);
}

/**
 * Lists the underlying planning assumptions and uncertainties for transparent user review
 */
export function identifyAssumptionsAndUncertainties(requirements: EventRequirements): {
  assumptions: string[];
  uncertainties: string[];
} {
  const assumptions: string[] = [
    `Guest attendance rate estimated at ~85-90% of declared headcount (${requirements.guestCount} invited).`,
    `Standard market rates applied for ${requirements.location || 'regional area'} vendor categories.`,
    `Venue rental allows standard load-in 45-60 minutes prior and load-out 30 minutes after event.`,
    `Standard power outlets (110V/220V) are included without separate utility meter charges.`,
  ];

  const uncertainties: string[] = [
    requirements.venueType === 'outdoor'
      ? 'Exact weather forecast is unpredictable beyond 7 days; precipitation probability will fluctuate.'
      : 'Venue acoustic reverberation and ambient noise levels cannot be verified without physical testing.',
    `Final guest RSVP drop-outs or unexpected plus-ones could impact catering by ±10%.`,
    'Fluctuating seasonal flower or fresh produce costs might alter specific catering or floral items slightly.',
  ];

  return { assumptions, uncertainties };
}
