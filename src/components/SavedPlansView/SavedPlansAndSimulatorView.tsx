import React, { useState } from 'react';
import {
  TrendingUp,
  Copy,
  Printer,
  Download,
  Trash2,
  Lock,
  Check,
} from 'lucide-react';
import { EventPlan } from '../../types/event';
import { simulateWhatIf } from '../../utils/budgetEngine';
import { generateEventBrief } from '../../utils/exportUtils';

interface SavedPlansAndSimulatorViewProps {
  activePlan: EventPlan;
  savedPlans: EventPlan[];
  onSelectPlan: (planId: string) => void;
  onDeletePlan: (planId: string) => void;
  onDuplicatePlan: (plan: EventPlan) => void;
  onOpenWizard: () => void;
}

export const SavedPlansAndSimulatorView: React.FC<SavedPlansAndSimulatorViewProps> = ({
  activePlan,
  savedPlans,
  onSelectPlan,
  onDeletePlan,
  onDuplicatePlan,
  onOpenWizard,
}) => {
  // What-If Simulator State
  const [guestDelta, setGuestDelta] = useState<number>(10);
  const [budgetDelta, setBudgetDelta] = useState<number>(0);
  const [copiedBrief, setCopiedBrief] = useState(false);

  const simulation = simulateWhatIf(
    activePlan.budget,
    activePlan.requirements.guestCount,
    guestDelta,
    budgetDelta
  );

  const handleCopyBrief = () => {
    const briefText = generateEventBrief(activePlan);
    navigator.clipboard.writeText(briefText);
    setCopiedBrief(true);
    setTimeout(() => setCopiedBrief(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(activePlan, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activePlan.requirements.title.replace(/\s+/g, '_')}_Plan.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* SECTION 1: WHAT-IF SIMULATOR */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-subtle space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-navy-900">What-If Scenario Simulator</h2>
              <p className="text-xs text-slate-500">
                Safely model the mathematical impact of changing guest count or budget constraints
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
            Current: {activePlan.requirements.guestCount} Guests • {activePlan.budget.currency}{' '}
            {activePlan.budget.totalBudget.toLocaleString()}
          </span>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Guest Delta Slider */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800">
                Adjust Guest Headcount:
              </label>
              <span className="font-extrabold text-indigo-600">
                {guestDelta >= 0 ? `+${guestDelta}` : guestDelta} Guests (Total: {simulation.newGuestCount})
              </span>
            </div>
            <input
              type="range"
              min={-20}
              max={50}
              step={5}
              value={guestDelta}
              onChange={(e) => setGuestDelta(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>-20 Guests</span>
              <span>Baseline (0)</span>
              <span>+50 Guests</span>
            </div>
          </div>

          {/* Budget Delta Slider */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800">
                Adjust Total Budget Cap:
              </label>
              <span className="font-extrabold text-indigo-600">
                {budgetDelta >= 0 ? `+${activePlan.budget.currency} ${budgetDelta}` : `${activePlan.budget.currency} ${budgetDelta}`} (Total: {activePlan.budget.currency} {simulation.newTotalBudget.toLocaleString()})
              </span>
            </div>
            <input
              type="range"
              min={-2000}
              max={5000}
              step={250}
              value={budgetDelta}
              onChange={(e) => setBudgetDelta(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>-2,000</span>
              <span>Baseline ($0)</span>
              <span>+5,000</span>
            </div>
          </div>
        </div>

        {/* Simulation Output Card */}
        <div
          className={`p-5 rounded-xl border space-y-3 text-xs ${
            simulation.status === 'exceeded'
              ? 'bg-rose-50 border-rose-200 text-rose-950'
              : simulation.status === 'tight'
              ? 'bg-amber-50 border-amber-200 text-amber-950'
              : 'bg-emerald-50 border-emerald-200 text-emerald-950'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-current/10 pb-2.5">
            <div className="flex items-center space-x-2">
              <span className="font-bold uppercase tracking-wider text-[11px]">
                Simulation Result: {simulation.status.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span>
                Simulated Cost:{' '}
                <strong>
                  {activePlan.budget.currency} {simulation.simulatedTotalCost.toLocaleString()}
                </strong>
              </span>
              <span>
                Per-Guest Cost: <strong>~{activePlan.budget.currency} {simulation.simulatedPerGuestCost}</strong>
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <strong className="block text-[11px]">Projected Trade-Offs & Budget Impact:</strong>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              {simulation.tradeOffs.map((t, idx) => (
                <li key={idx}>{t}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* SECTION 2: EXPORT & SHARING CONTROLS */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-subtle space-y-4">
        <h2 className="text-base font-bold text-navy-900 border-b border-slate-100 pb-3">
          Export & Stakeholder Communication
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Copy Brief Button */}
          <button
            type="button"
            onClick={handleCopyBrief}
            className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 text-left transition space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                {copiedBrief ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase">
                {copiedBrief ? 'Copied!' : 'Clipboard'}
              </span>
            </div>
            <div>
              <strong className="block text-xs text-navy-900 group-hover:text-indigo-700 transition">
                Copy One-Click Event Brief
              </strong>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Formatted markdown summary for WhatsApp, email, or committee meetings.
              </p>
            </div>
          </button>

          {/* Printable Plan */}
          <button
            type="button"
            onClick={handlePrint}
            className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 text-left transition space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <Printer className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-blue-600 uppercase">Print / PDF</span>
            </div>
            <div>
              <strong className="block text-xs text-navy-900 group-hover:text-indigo-700 transition">
                Print Official Plan Document
              </strong>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Generates a clean black-and-white printable run sheet and budget ledger.
              </p>
            </div>
          </button>

          {/* Download JSON Backup */}
          <button
            type="button"
            onClick={handleDownloadJSON}
            className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 text-left transition space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                <Download className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-purple-600 uppercase">JSON</span>
            </div>
            <div>
              <strong className="block text-xs text-navy-900 group-hover:text-indigo-700 transition">
                Download JSON Backup
              </strong>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Portable state file containing all requirements, timeline items, and costs.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* SECTION 3: SAVED PLANS REPOSITORY */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-subtle space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-navy-900">Saved Plans in Local Browser Storage</h2>
            <p className="text-xs text-slate-500">{savedPlans.length} celebration plans stored locally</p>
          </div>
          <button
            type="button"
            onClick={onOpenWizard}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            + Create New Plan
          </button>
        </div>

        <div className="space-y-2.5">
          {savedPlans.map((plan) => {
            const isActive = plan.id === activePlan.id;
            return (
              <div
                key={plan.id}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                  isActive
                    ? 'border-indigo-500 bg-indigo-50/40'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="space-y-1 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-navy-900 text-sm">
                      {plan.requirements.title || 'Untitled Event'}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {plan.requirements.eventType.replace('_', ' ')}
                    </span>
                    {isActive && (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-600 text-white">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Date: {plan.requirements.date} • Headcount: {plan.requirements.guestCount} guests • Budget:{' '}
                    {plan.budget.currency} {plan.budget.totalBudget.toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {!isActive && (
                    <button
                      type="button"
                      onClick={() => onSelectPlan(plan.id)}
                      className="px-3 py-1.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold transition"
                    >
                      Load Plan
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onDuplicatePlan(plan)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
                    title="Duplicate as template"
                  >
                    Duplicate
                  </button>
                  {savedPlans.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onDeletePlan(plan.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition"
                      title="Delete saved plan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 4: SECURITY & PRIVACY NOTICE */}
      <div className="p-4 bg-slate-100/70 rounded-2xl border border-slate-200 flex items-start space-x-3 text-xs text-slate-600">
        <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-slate-800 font-semibold block">Privacy & Client-Side Persistence:</strong>
          <p className="text-[11px] leading-relaxed">
            Your event specifications and budgets are stored exclusively in your browser’s local storage.
            EventWise AI does not sell or persist user personal records to any remote corporate databases.
            API keys are handled via secure server-side adapters and never exposed to the client bundle.
          </p>
        </div>
      </div>
    </div>
  );
};
