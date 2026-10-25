import { EventRequirements } from '../../src/types/event';
import { AIAdapter, AIPlanGenerationResult } from './aiAdapter';

export class DeterministicAdapter implements AIAdapter {
  isConfigured(): boolean {
    return true;
  }

  getProviderName(): string {
    return 'deterministic_engine';
  }

  async generatePlanCreative(requirements: EventRequirements): Promise<AIPlanGenerationResult> {
    const { eventType, theme, guestCount } = requirements;

    const themeTitle = theme && theme.trim().length > 0 ? theme : 'Celebratory Gathering';

    const rationalesByEvent: Record<string, { concept: string; atmosphere: string; fit: string; factors: string[] }> = {
      birthday: {
        concept: `${themeTitle} Milestone Experience`,
        atmosphere: `An intimate yet energetic vibe blending modern lounge aesthetics with interactive celebratory photo checkpoints.`,
        fit: `Optimized for ${guestCount} friends and family with a steady flow from welcoming drinks to spotlight moments.`,
        factors: [
          'Memorable cake-cutting and toast staging with optimal acoustics',
          'Smooth guest flow between dining tables and dance/mingling zones',
          'Strict budget preservation for main course quality over expensive single-use decor',
        ],
      },
      college_festival: {
        concept: `${themeTitle} Innovation & Sonic Fusion`,
        atmosphere: `High-octane campus festival energy featuring dynamic lighting, competitive showcases, and street-food vibes.`,
        fit: `Engineered for high foot-traffic (${guestCount} students) with synchronized stage rotations and robust safety paths.`,
        factors: [
          'Dual stage management to prevent artist transition dead-air',
          'Dedicated sponsor branding areas and student security perimeters',
          'Reinforced power distribution for multi-track audio gear',
        ],
      },
      wedding: {
        concept: `${themeTitle} Timeless Romance & Fellowship`,
        atmosphere: `Refined, warm elegance with subtle ambient lighting, heartfelt acoustic melodies, and seamless banquet service.`,
        fit: `Crafted for ${guestCount} guests spanning multiple generations, emphasizing comfortable seating and clear sightlines.`,
        factors: [
          'Flawless timeline choreography between ceremony, toasts, and open floor',
          'Allergen-conscious dietary labeling across all food stations',
          'Dedicated buffer zones for photographer and guest portraits',
        ],
      },
      family_gathering: {
        concept: `${themeTitle} Multi-Generational Reunion`,
        atmosphere: `Welcoming, conversational, and relaxed with multi-age activities, memory sharing, and hearty comfort food.`,
        fit: `Accessible for children, parents, and seniors with ample seating and shade.`,
        factors: [
          'Step-free ground-level dining and shaded seating stations',
          'Interactive storytelling or family trivia sessions',
          'Abundant self-serve refreshment dispensers',
        ],
      },
      community_event: {
        concept: `${themeTitle} Civic Engagement & Celebration`,
        atmosphere: `Inclusive, welcoming community spirit with local artisan highlights and accessible family entertainment.`,
        fit: `Spacious layout supporting open public circulation and community networking.`,
        factors: [
          'Clear directional signage and bilingual welcome station',
          'Sanitation, recycling, and first aid accessibility',
          'Weather-resilient canopy stations',
        ],
      },
    };

    const base = rationalesByEvent[eventType] || rationalesByEvent.birthday;

    const creativeRecommendations = [
      {
        title: 'Focal-Point Photo Installation',
        recommendation: `Anchor the entrance with a customized 8x8ft backdrop reflecting the "${themeTitle}" motif.`,
        rationale: 'Maximizes guest photo-sharing on social channels while keeping decorative spend concentrated.',
        impact: 'High visual impact for less than 10% of total decor budget.',
      },
      {
        title: 'Curated Flow & Transition Cueing',
        recommendation: 'Use 2-minute music level shifts to naturally guide guests from dining to the main activity stage without abrupt mic announcements.',
        rationale: 'Subconscious audio cueing preserves social momentum and avoids disruptive shouting.',
        impact: 'Smoother schedule adherence and higher guest satisfaction.',
      },
      {
        title: 'Allergen-Safe Buffet Demarcation',
        recommendation: 'Establish an independent dietary table positioned 5 feet away from the main banquet line for certified gluten-free, vegan, or nut-free dishes.',
        rationale: 'Eliminates cross-contact caused by shared spoons or sauce drips.',
        impact: 'Guarantees medical safety for attendees with sensitivities.',
      },
    ];

    return {
      isLiveAI: false,
      provider: 'deterministic_engine',
      conceptRationale: {
        themeConcept: base.concept,
        atmosphereDescription: base.atmosphere,
        targetAudienceFit: base.fit,
        keySuccessFactors: base.factors,
      },
      creativeRecommendations,
      customActivities: requirements.mustHaveActivities,
      notice: 'Generated using EventWise Deterministic Planning Engine (Demo / Fallback mode). Live AI is not enabled or credentials are absent.',
    };
  }
}
