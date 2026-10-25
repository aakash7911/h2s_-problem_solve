# EventWise AI — Intelligent Celebration & Event Planning Platform

> **PromptWars Virtual Challenge 5:** Celebration & Event Planner  
> **Status:** Production-Minded Full-Stack Application • Tested & Verified • Provider-Neutral AI

---

## 1. Project Overview & Problem Statement

Planning celebrations—birthdays, milestone weddings, student festivals, family reunions, and community charity events—is notoriously stressful and prone to failure. Organizers face tight budget caps, hidden vendor surcharges, conflicting schedules, dietary restrictions, accessibility hurdles, and unpredictable outdoor weather.

Traditional event planning software either acts as static checklist mockups or generic spreadsheets that offer zero intelligence. Meanwhile, naive LLM wrappers produce hallucinated vendor quotes and flawed arithmetic calculations that can ruin an event financially.

**EventWise AI** solves this by uniting **deterministic constraint engines** with **generative AI conceptualization**:
- **Deterministic Rigor:** Exact arithmetic, real-time overspending prevention, dynamic contingency reserve allocation, and conflict-detection algorithms guarantee mathematical correctness.
- **Generative AI Framing:** Context-aware theme concepts, atmosphere framing, and explainable recommendations tailored to the organizer's exact constraints.
- **Zero Fabrication Guarantee:** All sample vendor quotes are explicitly watermarked as demonstration models with transparent multi-criteria scoring.

---

## 2. Target User Persona

- **Primary Persona:** An event organizer, student festival head, family host, or couple coordinating a milestone event with a fixed budget, limited planning time, and strict requirements.
- **Key Pain Points:**
  - Fear of cost overruns from unexpected venue or catering surcharges.
  - Difficulty balancing guest expectations against financial realities.
  - Scheduling collisions (e.g., keynote overlapping band soundcheck, missing setup buffers).
  - Lack of accessible venues or allergen-safe catering options.
  - Weather vulnerability for outdoor venues.

---

## 3. Challenge Vertical

- **Track:** PromptWars Virtual Challenge 5: Celebration & Event Planner
- **Vertical:** Intelligent Celebration Architecture, Constraint-Aware Scheduling, and Budget Defense.

---

## 4. Key Features & High-Impact Differentiators

### A. Core Planning Views
1. **Interactive Creation Wizard:** Multi-step accessible setup collecting event type, guest count, budget, currency, theme, indoor/outdoor preferences, dietary allergens, accessibility requirements, and planning priorities.
2. **Executive Planning Dashboard:** High-level cockpit featuring budget health, countdown clock, key success factors, and a real-time **Plan Completeness Score (0–100)** with an inspectable breakdown.
3. **AI Plan Concept & Rationale:** Deep narrative concept explaining atmosphere and guest flow, paired with actionable checklists (Venue, Catering, AV, Decor) and provenance tags distinguishing `[USER FACT]`, `[CALCULATED ESTIMATE]`, and `[AI SUGGESTION]`.
4. **Budget & Expense Management:** Interactive expense ledger with instant recalculation, **Essential vs. Optional expense protection**, realistic savings alternatives drawer, and **Recharts data visualizations** (Category Allocation Donut & Target vs. Estimated Bar Chart).
5. **Timeline & Task Management:** Run-of-show agenda with **Constraint Conflict Detection** (flags overlapping spotlight events, missing vendor setup windows, and prerequisite sequence violations) alongside time-anchored preparation tasks.
6. **Multi-Criteria Vendor Evaluation Matrix:** Multi-factor scoring across Price, Rating, Availability, and Accessibility. Includes user-adjustable weight sliders, transparent trade-off rationale, and a custom quote evaluator.
7. **Risk & Contingency Command Center:** Threat matrix covering outdoor weather risks, electrical/power hazards, allergen contamination, and vendor delays with concrete contingency playbooks.
8. **Saved Plans & What-If Simulator:** Interactive sliders to model guest surges or budget cuts with real-time recalculation of per-guest costs, local storage persistence, and one-click printable brief exports.

### B. High-Impact Differentiators
- **What-If Simulator:** Compare alternative guest headcounts and budget caps side-by-side with trade-off explanations.
- **Budget Pressure Indicator:** Real-time feedback alerting organizers whether commitments are *Healthy*, *Moderate*, or *Critical*.
- **Plan Completeness Inspector:** Algorithmic scoring breakdown showing why points were awarded across basic details, budget balance, contingency funding, timeline validity, and safety preparedness.
- **One-Click Event Brief:** Instant export of a clean, standardized Markdown or printable PDF summary for vendors, families, and committee members.
- **Demonstration Record Integrity:** Explicit demo tagging prevents deception while demonstrating advanced multi-criteria ranking.

---

## 5. Technical Architecture

EventWise AI utilizes a modern, lightweight, high-performance architecture:

```
eventwise-ai/
├── src/
│   ├── types/
│   │   └── event.ts                 # Full TypeScript domain models
│   ├── utils/
│   │   ├── budgetEngine.ts          # Deterministic budget math, allocations, what-if simulator
│   │   ├── scheduleEngine.ts        # Conflict detector, overlap & dependency analysis
│   │   ├── vendorEngine.ts          # Multi-criteria weighted scoring algorithm
│   │   ├── riskEngine.ts            # Weather, allergen, and delay risk analyzer
│   │   ├── completenessEngine.ts    # Explainable plan completeness evaluator
│   │   ├── exportUtils.ts           # Markdown brief generator & checklists
│   │   └── storage.ts               # Local persistence & demo plan seeds
│   ├── components/
│   │   ├── Navigation/Navbar.tsx    # Header, active plan switcher, AI status indicator
│   │   ├── Wizard/EventWizard.tsx   # 4-step event creation wizard
│   │   ├── Dashboard/DashboardView.tsx # Metrics, alerts, and completeness inspector
│   │   ├── PlanView/PlanConceptView.tsx # Concept, rationale, recommendations, checklists
│   │   ├── BudgetView/BudgetManagementView.tsx # Recharts charts, expense ledger, savings
│   │   ├── TimelineView/TimelineManagementView.tsx # Schedule run sheet & task tracker
│   │   ├── VendorsView/VendorComparisonView.tsx # Weighted ranking matrix
│   │   ├── RisksView/RiskCenterView.tsx # Risk matrix & playbooks
│   │   ├── SavedPlansView/SavedPlansAndSimulatorView.tsx # What-If simulator & backup
│   │   └── ExportModal.tsx          # Export brief modal
│   ├── test/                        # Automated Vitest test suites
│   ├── App.tsx                      # Root component & view router
│   ├── main.tsx                     # Entrypoint
│   └── index.css                    # Tailwind CSS & print media styles
├── server/
│   ├── index.ts                     # Express API with rate limiting & security headers
│   └── adapters/
│       ├── aiAdapter.ts             # Provider-neutral AI interface
│       ├── geminiAdapter.ts         # Google Gemini generative adapter
│       └── deterministicAdapter.ts  # Fallback demo engine
├── .env.example                     # Safe environment variable template
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 6. AI Integration & Decision-Making Engine

### The Hybrid Deterministic + LLM Pipeline
To guarantee safety and financial reliability, the platform strictly separates responsibilities:

1. **Calculations & Constraints (Deterministic):**
   - Arithmetic addition, subtraction, and category percentages.
   - Remaining headroom and deficit detection.
   - Overlap interval math (`max(startA, startB) < min(endA, endB)`).
   - Prerequisite dependency verification.
   - Multi-criteria weighted scoring (`price * w1 + rating * w2 + availability * w3 + accessibility * w4`).
2. **Language & Concept Synthesis (Generative AI):**
   - Synthesizing cohesive theme concepts and atmosphere descriptions.
   - Tailoring creative ideas to attendee demographics.
   - Formulating conversational rationales explaining why specific actions are suggested.

### Provider-Neutral AI Adapter
The backend server implements the `AIAdapter` interface. It natively supports **Google Gemini (`gemini-1.5-flash`)** with structured JSON output, timeouts, and error handling. If no API key is provided, the platform automatically runs in **DEMO MODE** powered by the `DeterministicAdapter`, delivering a 100% functional experience without requiring external cloud accounts.

---

## 7. Assumptions & Limitations

- **Currency:** Supports major currencies (`USD`, `EUR`, `GBP`, `INR`, `CAD`, `AUD`). Exchange rates are static within an active plan.
- **Attendance Rate:** Default variable catering costs assume an 85–90% final RSVP attendance.
- **Weather Forecasts:** Weather threats are determined based on venue constraints (outdoor vs. indoor) and planning horizons; live Doppler radar integration requires local micro-climate sensors.
- **Demonstration Records:** Vendor quotes are synthetically modeled for demonstration and scoring comparison.

---

## 8. Setup & Installation Instructions

### Prerequisites
- Node.js `v18+` or `v20+` (tested on Node v22.17.0)
- npm `v9+` or `v10+`

### Installation
```bash
# 1. Clone repository
git clone <repository-url>
cd h2s

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
```

---

## 9. Environment Variable Configuration

Edit `.env` (optional for live AI; demo mode works out of the box):

```env
# Server Port
PORT=3001

# AI Provider Configuration
AI_PROVIDER=gemini

# Google Gemini API Key (optional - get one from https://aistudio.google.com/)
GEMINI_API_KEY=your_gemini_api_key_here

# Optional Model override
GEMINI_MODEL=gemini-1.5-flash

# Security Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=40
```

---

## 10. Development, Test & Build Commands

```bash
# Run both Backend API and Vite Frontend concurrently:
npm run dev

# Run only the Vite Frontend client:
npm run client:dev

# Run only the Express Backend server:
npm run server:dev

# Run automated test suites (20 tests passing):
npm test

# Run TypeScript type check:
npx tsc --noEmit

# Compile production bundle:
npm run build
```

---

## 11. Automated Test Suite Summary

EventWise AI includes automated tests covering all critical engines:
- `src/test/budgetEngine.test.ts`: Category percentage allocation, contingency reserve math, deficit detection, and what-if simulation calculations.
- `src/test/scheduleEngine.test.ts`: Overlapping activity collision, missing setup buffer detection, and dependency order violations.
- `src/test/vendorEngine.test.ts`: Multi-criteria suitability scoring, price penalties, accessibility multipliers, and demonstration tagging.
- `src/test/completenessEngine.test.ts`: Plan completeness score calculation, breakdown factors, and provenance verification (`user_fact` vs. `calculated_estimate` vs. `ai_suggestion`).
- `src/test/validationAndAI.test.ts`: Input validation, missing key handling, fallback resilience, and schema conformity.

---

## 12. Security Considerations & Responsible Design

- **Client-Side Privacy:** All event plans and budgets are stored in browser `localStorage`. No user plans are sent to third-party tracking databases.
- **Secret Isolation:** Generative AI API keys reside solely on the Express server and are never bundled into frontend assets.
- **Request Limiting:** In-memory IP rate limiter guards backend endpoints against abuse.
- **Input Sanitization:** JSON payloads are restricted to a maximum 256 KB size with strict type validation.
- **No Deceptive Fabrications:** Sample vendor records are permanently watermarked as demonstration entities.

---

## 13. Repository & Branch Verification

- **Branch Policy:** Strictly maintained on a single Git branch (`main`).
- **Repository Size:** Under 2 MB (well beneath the 10 MB challenge limit).
- **Zero Committed Secrets:** `.env` and `node_modules` are permanently ignored via `.gitignore`.

---

## 14. GitHub Publishing Instructions

To publish this repository to GitHub:

```bash
# 1. Stage all project files (safe .gitignore prevents untracked artifacts)
git add .

# 2. Create the initial commit
git commit -m "feat: complete EventWise AI platform for PromptWars Challenge 5"

# 3. Create a new public repository on GitHub (e.g. using the GitHub CLI):
# gh repo create eventwise-ai --public --source=. --remote=origin --push

# Or add your existing GitHub remote manually:
# git remote add origin https://github.com/<your-username>/eventwise-ai.git
# git branch -M main
# git push -u origin main
```

---

## 15. License

MIT License. Designed and built for the **PromptWars Virtual Challenge 5**.
