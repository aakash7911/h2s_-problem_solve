import { EventRequirements } from '../../src/types/event';

export interface AIPlanGenerationResult {
  isLiveAI: boolean;
  provider: 'gemini' | 'openai' | 'deterministic_engine';
  conceptRationale: {
    themeConcept: string;
    atmosphereDescription: string;
    targetAudienceFit: string;
    keySuccessFactors: string[];
  };
  creativeRecommendations: {
    title: string;
    recommendation: string;
    rationale: string;
    impact: string;
  }[];
  customActivities: string[];
  suggestedChecklists?: {
    title: string;
    items: string[];
  }[];
  notice?: string;
}

export interface AIAdapter {
  isConfigured(): boolean;
  getProviderName(): string;
  generatePlanCreative(requirements: EventRequirements): Promise<AIPlanGenerationResult>;
}
