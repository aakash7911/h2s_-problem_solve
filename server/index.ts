import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { EventRequirements, EventPlan } from '../src/types/event';
import { GeminiAdapter } from './adapters/geminiAdapter';
import { DeterministicAdapter } from './adapters/deterministicAdapter';
import { AIAdapter } from './adapters/aiAdapter';
import {
  calculateBudgetBreakdown,
  generateDefaultExpenses,
  simulateWhatIf,
} from '../src/utils/budgetEngine';
import {
  generateDefaultSchedule,
  detectScheduleConflicts,
  generateDefaultTasks,
} from '../src/utils/scheduleEngine';
import { analyzeRisks } from '../src/utils/riskEngine';
import { generateDemoVendors } from '../src/utils/vendorEngine';
import {
  calculatePlanCompleteness,
  generateRecommendations,
} from '../src/utils/completenessEngine';
import { generateDefaultChecklists } from '../src/utils/exportUtils';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Sensible security middleware
app.use(cors());
app.use(express.json({ limit: '256kb' }));

// In-memory rate limiter: maximum 40 requests per minute per IP
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60000;
const MAX_REQUESTS = 40;

app.use((req, res, next) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  if (record.count >= MAX_REQUESTS) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Too many requests. Please wait a minute before generating or adapting plans.',
    });
  }

  record.count += 1;
  next();
});

// Select AI Adapter based on environment configuration
let aiAdapter: AIAdapter;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
  aiAdapter = new GeminiAdapter();
} else {
  aiAdapter = new DeterministicAdapter();
}

/**
 * Health check endpoint indicating AI status and execution mode
 */
app.get('/api/health', (_req: Request, res: Response) => {
  const isAIConfigured = aiAdapter.isConfigured();
  res.json({
    status: 'ok',
    mode: isAIConfigured ? 'live_ai' : 'demo_mode',
    provider: aiAdapter.getProviderName(),
    aiConfigured: isAIConfigured,
    message: isAIConfigured
      ? 'Connected to live Google Gemini AI via Server Environment Variable'
      : 'Running in DEMO MODE with deterministic event planning engine',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Core Plan Generation Endpoint
 */
app.post('/api/generate-plan', async (req: Request, res: Response) => {
  try {
    const requirements: EventRequirements = req.body;

    // Strict Input Validation
    if (!requirements || typeof requirements !== 'object') {
      return res.status(400).json({ error: 'Invalid payload: Event requirements body required.' });
    }

    if (!requirements.title || requirements.title.trim().length === 0) {
      return res.status(400).json({ error: 'Missing required field: title' });
    }

    if (!requirements.guestCount || requirements.guestCount <= 0) {
      return res.status(400).json({ error: 'Invalid field: guestCount must be greater than 0' });
    }

    if (!requirements.totalBudget || requirements.totalBudget <= 0) {
      return res.status(400).json({ error: 'Invalid field: totalBudget must be greater than 0' });
    }

    // 1. Get creative rationale and recommendations from AI Adapter (or deterministic engine)
    const aiResult = await aiAdapter.generatePlanCreative(requirements);

    // 2. Compute deterministic budget
    const defaultExpenses = generateDefaultExpenses(requirements);
    const budget = calculateBudgetBreakdown(
      requirements.totalBudget,
      requirements.currency || 'USD',
      defaultExpenses,
      requirements.contingencyPercentage || 10,
      requirements.eventType || 'birthday'
    );

    // 3. Compute deterministic timeline & conflict detection
    const schedule = generateDefaultSchedule(requirements);
    const scheduleConflicts = detectScheduleConflicts(
      schedule,
      requirements.startTime || '18:00',
      requirements.durationHours || 4
    );

    // 4. Compute tasks, checklists, demo vendors, and risks
    const tasks = generateDefaultTasks(requirements);
    const checklists = generateDefaultChecklists(requirements.eventType || 'birthday');
    const vendors = generateDemoVendors(requirements, budget);
    const risks = analyzeRisks(requirements, budget);

    // 5. Build explainable recommendations (combining deterministic logic & AI creative suggestions)
    const baseRecommendations = generateRecommendations(requirements, budget);
    if (aiResult.creativeRecommendations && aiResult.creativeRecommendations.length > 0) {
      for (const cr of aiResult.creativeRecommendations) {
        baseRecommendations.push({
          id: `ai-rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          category: 'AI Recommendation',
          title: cr.title,
          recommendation: cr.recommendation,
          rationale: cr.rationale,
          originType: aiResult.isLiveAI ? 'ai_suggestion' : 'calculated_estimate',
          impact: cr.impact,
        });
      }
    }

    // 6. Compute Plan Completeness Score
    const completeness = calculatePlanCompleteness(requirements, budget, scheduleConflicts, tasks, risks);

    const plan: EventPlan = {
      id: requirements.id || `plan-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isAIGenerated: aiResult.isLiveAI,
      aiProviderUsed: aiResult.provider,
      requirements,
      conceptRationale: aiResult.conceptRationale,
      budget,
      schedule,
      scheduleConflicts,
      tasks,
      checklists,
      vendors,
      risks,
      recommendations: baseRecommendations,
      completeness,
      changeHistory: [
        {
          timestamp: new Date().toISOString(),
          description: aiResult.isLiveAI ? 'Generated plan using Live AI' : 'Generated plan in Demo Mode',
          impactSummary: `Allocated ${budget.currency} ${budget.totalBudget.toLocaleString()} for ${requirements.guestCount} guests.`,
        },
      ],
    };

    return res.json({
      success: true,
      plan,
      isLiveAI: aiResult.isLiveAI,
      provider: aiResult.provider,
      notice: aiResult.notice,
    });
  } catch (err: any) {
    console.error('Plan generation failed:', err);
    return res.status(500).json({
      error: 'Plan generation failed',
      message: err?.message || 'Internal server error while formulating plan.',
    });
  }
});

/**
 * Adaptive Planning Endpoint: Recalculates plan when constraints or inputs change
 */
app.post('/api/adapt-plan', (req: Request, res: Response) => {
  try {
    const { currentPlan, changes }: { currentPlan: EventPlan; changes: Partial<EventRequirements> } = req.body;

    if (!currentPlan || !currentPlan.requirements) {
      return res.status(400).json({ error: 'Missing currentPlan object' });
    }

    const updatedRequirements: EventRequirements = {
      ...currentPlan.requirements,
      ...changes,
    };

    // Keep user-edited expenses, but adjust variable categories if guest count changed significantly
    const prevGuests = currentPlan.requirements.guestCount;
    const newGuests = updatedRequirements.guestCount;
    const guestRatio = newGuests / (prevGuests || 1);

    const adaptedItems = currentPlan.budget.items.map((item) => {
      if (guestRatio !== 1 && (item.category === 'catering' || item.category === 'invitations')) {
        return {
          ...item,
          estimatedCost: Math.round(item.estimatedCost * guestRatio),
          actualCost: item.actualCost ? Math.round(item.actualCost * guestRatio) : undefined,
        };
      }
      return item;
    });

    const newBudget = calculateBudgetBreakdown(
      updatedRequirements.totalBudget,
      updatedRequirements.currency,
      adaptedItems,
      updatedRequirements.contingencyPercentage,
      updatedRequirements.eventType
    );

    const newSchedule = generateDefaultSchedule(updatedRequirements);
    const newConflicts = detectScheduleConflicts(
      newSchedule,
      updatedRequirements.startTime,
      updatedRequirements.durationHours
    );

    const newRisks = analyzeRisks(updatedRequirements, newBudget);
    const newCompleteness = calculatePlanCompleteness(
      updatedRequirements,
      newBudget,
      newConflicts,
      currentPlan.tasks,
      newRisks
    );

    const impactPoints: string[] = [];
    if (changes.guestCount && changes.guestCount !== prevGuests) {
      impactPoints.push(`Guest count adjusted from ${prevGuests} to ${newGuests}. Variable catering scaled accordingly.`);
    }
    if (changes.totalBudget && changes.totalBudget !== currentPlan.requirements.totalBudget) {
      impactPoints.push(`Total budget shifted to ${updatedRequirements.currency} ${updatedRequirements.totalBudget.toLocaleString()}.`);
    }
    if (changes.venueType && changes.venueType !== currentPlan.requirements.venueType) {
      impactPoints.push(`Venue type changed to ${changes.venueType}. Weather and logistical risks refreshed.`);
    }

    const impactSummary = impactPoints.join(' ') || 'Plan parameters synchronized with new inputs.';

    const adaptedPlan: EventPlan = {
      ...currentPlan,
      updatedAt: new Date().toISOString(),
      requirements: updatedRequirements,
      budget: newBudget,
      schedule: newSchedule,
      scheduleConflicts: newConflicts,
      risks: newRisks,
      completeness: newCompleteness,
      changeHistory: [
        ...(currentPlan.changeHistory || []),
        {
          timestamp: new Date().toISOString(),
          description: 'Adaptive recalculation applied',
          impactSummary,
        },
      ],
    };

    return res.json({
      success: true,
      plan: adaptedPlan,
      impactSummary,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to adapt plan', message: err?.message });
  }
});

/**
 * What-If Simulation Endpoint
 */
app.post('/api/simulate', (req: Request, res: Response) => {
  try {
    const { currentBudget, guestCount, guestDelta, budgetDelta } = req.body;
    if (!currentBudget || guestCount === undefined) {
      return res.status(400).json({ error: 'Missing simulation parameters' });
    }

    const result = simulateWhatIf(currentBudget, guestCount, guestDelta || 0, budgetDelta || 0);
    return res.json({ success: true, simulation: result });
  } catch (err: any) {
    return res.status(500).json({ error: 'Simulation failed', message: err?.message });
  }
});

// Production static assets serving if dist folder exists
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start listening
if (process.env.NODE_ENV !== 'test') {
  const portNumber = typeof PORT === 'string' ? parseInt(PORT, 10) : PORT;
  app.listen(portNumber, '0.0.0.0', () => {
    console.log(`EventWise AI server running on port ${portNumber}`);
    console.log(`Mode: ${aiAdapter.isConfigured() ? 'LIVE AI' : 'DEMO MODE'}`);
  });
}

export default app;
