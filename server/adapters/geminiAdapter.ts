import { EventRequirements } from '../../src/types/event';
import { AIAdapter, AIPlanGenerationResult } from './aiAdapter';
import { DeterministicAdapter } from './deterministicAdapter';

export class GeminiAdapter implements AIAdapter {
  private apiKey: string;
  private model: string;
  private fallback: DeterministicAdapter;

  constructor(apiKey?: string, model: string = 'gemini-1.5-flash') {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';
    this.model = process.env.GEMINI_MODEL || model;
    this.fallback = new DeterministicAdapter();
  }

  isConfigured(): boolean {
    return !!(this.apiKey && this.apiKey.trim().length > 5 && !this.apiKey.includes('your_gemini_api_key'));
  }

  getProviderName(): string {
    return 'gemini';
  }

  async generatePlanCreative(requirements: EventRequirements): Promise<AIPlanGenerationResult> {
    if (!this.isConfigured()) {
      return this.fallback.generatePlanCreative(requirements);
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const prompt = `You are EventWise AI, an expert celebration and event planning architect.
Analyze the following event parameters and produce a creative, inspiring, yet realistic concept rationale and tailored recommendations.

EVENT PARAMETERS:
- Event Type: ${requirements.eventType}
- Title: ${requirements.title}
- Date: ${requirements.date} (${requirements.startTime}, ${requirements.durationHours} hours)
- Headcount: ${requirements.guestCount} guests
- Budget: ${requirements.currency} ${requirements.totalBudget}
- Location: ${requirements.location} (${requirements.venueType})
- Theme: ${requirements.theme || 'Celebratory'}
- Priority: ${requirements.priority}
- Risk Tolerance: ${requirements.riskTolerance}
- Dietary Needs: ${requirements.dietaryRequirements.join(', ') || 'None specified'}
- Accessibility Needs: ${requirements.accessibilityRequirements.join(', ') || 'Standard step-free entrance'}
- Must-Have Activities: ${requirements.mustHaveActivities.join(', ') || 'Standard celebration'}

OUTPUT FORMAT REQUIREMENTS:
Respond ONLY with a valid JSON object matching this schema (no markdown fences, no explanatory text):
{
  "themeConcept": "Concise concept name",
  "atmosphereDescription": "1-2 sentences capturing vibe, lighting, and mood",
  "targetAudienceFit": "Explanation of how this caters to the specific headcount and attendee group",
  "keySuccessFactors": ["Factor 1", "Factor 2", "Factor 3"],
  "creativeRecommendations": [
    {
      "title": "Short title",
      "recommendation": "Concrete actionable recommendation",
      "rationale": "Clear explanation of why this was suggested for this specific event",
      "impact": "Expected outcome on guest experience or budget"
    }
  ]
}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1200,
            responseMimeType: 'application/json',
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        console.warn(`Gemini API returned status ${response.status}. Using deterministic fallback.`);
        return this.fallback.generatePlanCreative(requirements);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        return this.fallback.generatePlanCreative(requirements);
      }

      // Clean response if fences present
      const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanedText);

      return {
        isLiveAI: true,
        provider: 'gemini',
        conceptRationale: {
          themeConcept: parsed.themeConcept || `${requirements.theme || 'Celebration'} Experience`,
          atmosphereDescription: parsed.atmosphereDescription || 'Warm and thoughtfully curated celebration.',
          targetAudienceFit: parsed.targetAudienceFit || `Designed for ${requirements.guestCount} guests.`,
          keySuccessFactors: Array.isArray(parsed.keySuccessFactors) ? parsed.keySuccessFactors : ['Seamless guest flow'],
        },
        creativeRecommendations: Array.isArray(parsed.creativeRecommendations)
          ? parsed.creativeRecommendations
          : [],
        customActivities: requirements.mustHaveActivities,
      };
    } catch (err: any) {
      clearTimeout(timeout);
      console.warn('Gemini AI generation failed or timed out:', err?.message || err);
      return this.fallback.generatePlanCreative(requirements);
    }
  }
}
