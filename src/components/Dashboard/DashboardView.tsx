import React, { useState } from 'react';
import {
  Calendar,
  DollarSign,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import { EventPlan } from '../../types/event';

interface DashboardViewProps {
  plan: EventPlan;
  onNavigate: (tab: string) => void;
  onOpenWizard: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ plan, onNavigate, onOpenWizard }) => {
  const [showCompletenessModal, setShowCompletenessModal] = useState(false);

  const { requirements, budget, scheduleConflicts, completeness } = plan;

  // Calculate days until event
  const today = new Date();
  const eventDate = new Date(requirements.date);
  const diffTime = eventDate.getTime() - today.getTime();
  const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const perGuestBudget = Math.round(budget.totalBudget / Math.max(1, requirements.guestCount));

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Welcome & Event Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-elevated relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-300 via-transparent to-transparent" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                {requirements.eventType.replace('_', ' ')}
              </span>
              <span className="text-xs text-indigo-200">
                {requirements.date} • {requirements.startTime} ({requirements.durationHours} hrs)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{requirements.title}</h1>
            <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
              {plan.conceptRationale.atmosphereDescription ||
                `Coordinated for ${requirements.guestCount} guests with budget focus in ${requirements.location}.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('plan')}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
            >
              <Sparkles className="w-4 h-4 text-indigo-200" />
              <span>Inspect AI Concept</span>
            </button>
            <button
              type="button"
              onClick={onOpenWizard}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 transition-colors"
            >
              <span>Edit Details</span>
            </button>
          </div>
        </div>
      </div>

      {/* Budget Pressure Alert Banner (If Critical or Moderate) */}
      {budget.budgetPressureLevel !== 'healthy' && (
        <div
          className={`p-4 rounded-xl border flex items-start justify-between gap-3 text-xs ${
            budget.budgetPressureLevel === 'critical'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-start space-x-3">
            <AlertTriangle
              className={`w-5 h-5 shrink-0 mt-0.5 ${
                budget.budgetPressureLevel === 'critical' ? 'text-rose-600' : 'text-amber-600'
              }`}
            />
            <div>
              <strong className="font-bold uppercase tracking-wider text-[11px] block">
                {budget.budgetPressureLevel === 'critical' ? 'Critical Budget Pressure Alert' : 'Moderate Budget Advisory'}
              </strong>
              <p className="mt-0.5">{budget.budgetPressureReason}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('budget')}
            className="shrink-0 font-bold underline hover:no-underline text-xs"
          >
            Review Budget & Savings &rarr;
          </button>
        </div>
      )}

      {/* Schedule Conflicts Alert Banner (If any detected) */}
      {scheduleConflicts.length > 0 && (
        <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 text-orange-900 flex items-start justify-between gap-3 text-xs">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold uppercase tracking-wider text-[11px] block">
                {scheduleConflicts.length} Timeline Constraint Conflict(s) Detected
              </strong>
              <p className="mt-0.5">{scheduleConflicts[0].description}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('timeline')}
            className="shrink-0 font-bold underline hover:no-underline text-xs"
          >
            Fix in Timeline &rarr;
          </button>
        </div>
      )}

      {/* 4 Core Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Budget Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Budget</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-navy-900 tracking-tight">
              {budget.currency} {budget.totalBudget.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center space-x-1">
              <span>Remaining Headroom:</span>
              <span
                className={`font-bold ${
                  budget.remainingBudget < 0
                    ? 'text-rose-600'
                    : budget.remainingBudget < 200
                    ? 'text-amber-600'
                    : 'text-emerald-600'
                }`}
              >
                {budget.currency} {budget.remainingBudget.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Per-Guest Budget */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Per-Guest Target</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-navy-900 tracking-tight">
              {budget.currency} {perGuestBudget}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              For {requirements.guestCount} confirmed attendees
            </div>
          </div>
        </div>

        {/* Days Until Celebration */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Event Countdown</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-navy-900 tracking-tight">
              {daysUntil >= 0 ? `${daysUntil} Days` : 'Past Event'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Scheduled on {requirements.date}
            </div>
          </div>
        </div>

        {/* Plan Completeness Score Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <div className="flex items-center space-x-1">
              <span className="text-xs font-semibold">Completeness</span>
              <button
                type="button"
                onClick={() => setShowCompletenessModal(true)}
                className="text-slate-400 hover:text-indigo-600"
                title="Inspect completeness breakdown"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </div>
            <span
              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                completeness.score >= 80
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : completeness.score >= 60
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {completeness.level}
            </span>
          </div>
          <div>
            <div className="flex items-baseline space-x-1">
              <span className="text-xl sm:text-2xl font-black text-navy-900 tracking-tight">{completeness.score}</span>
              <span className="text-xs text-slate-400">/ 100</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  completeness.score >= 80 ? 'bg-emerald-500' : completeness.score >= 60 ? 'bg-indigo-600' : 'bg-amber-500'
                }`}
                style={{ width: `${completeness.score}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mid-Row: Concept Highlights & Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Concept Rationale & Highlights */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-navy-900">Event Concept & Strategic Focus</h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('plan')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center space-x-1"
            >
              <span>Full Plan</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Theme Conception
              </span>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                {plan.conceptRationale.themeConcept}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {plan.conceptRationale.keySuccessFactors.slice(0, 3).map((factor, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-slate-100 bg-white shadow-xs">
                  <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs font-bold mb-1.5">
                    0{idx + 1}
                  </div>
                  <p className="text-xs text-slate-700 leading-normal">{factor}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Quick Navigation Tiles */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-3">
          <h2 className="text-base font-bold text-navy-900 border-b border-slate-100 pb-3">Planning Tools</h2>

          <div className="space-y-2">
            {[
              {
                id: 'budget',
                title: 'Budget & Cost Protection',
                desc: `${budget.items.length} line items • ${budget.currency} ${budget.contingencyReserve.toLocaleString()} reserve`,
                icon: DollarSign,
                color: 'text-indigo-600 bg-indigo-50',
              },
              {
                id: 'timeline',
                title: 'Timeline & Run-of-Show',
                desc: `${plan.schedule.length} agenda items • ${scheduleConflicts.length} conflict(s)`,
                icon: Clock,
                color: 'text-blue-600 bg-blue-50',
              },
              {
                id: 'vendors',
                title: 'Vendor Comparison Matrix',
                desc: `${plan.vendors.length} vendor candidates evaluated`,
                icon: Users,
                color: 'text-purple-600 bg-purple-50',
              },
              {
                id: 'risks',
                title: 'Risk & Weather Center',
                desc: `${plan.risks.length} mitigation playbooks ready`,
                icon: ShieldCheck,
                color: 'text-emerald-600 bg-emerald-50',
              },
              {
                id: 'saved',
                title: 'What-If Simulator & Export',
                desc: 'Simulate guest/budget deltas & print briefs',
                icon: TrendingUp,
                color: 'text-amber-600 bg-amber-50',
              },
            ].map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => onNavigate(tool.id)}
                  className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-slate-50 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${tool.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
                        {tool.title}
                      </div>
                      <div className="text-[11px] text-slate-500">{tool.desc}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Plan Completeness Inspector Modal */}
      {showCompletenessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-elevated border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-navy-900 text-base">Plan Completeness Breakdown</h3>
                <p className="text-xs text-slate-500">Transparent calculation criteria (Score: {completeness.score}/100)</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCompletenessModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none p-1"
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-medium text-slate-700">Basic Details & Constraints Specified</span>
                {completeness.breakdown.basicDetailsCompleted ? (
                  <span className="text-emerald-700 font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-4 h-4" /> <span>Passed (20 pts)</span>
                  </span>
                ) : (
                  <span className="text-amber-700 font-bold">Needs Review</span>
                )}
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-medium text-slate-700">Budget Non-Deficit (Within Cap)</span>
                {completeness.breakdown.budgetBalanced ? (
                  <span className="text-emerald-700 font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-4 h-4" /> <span>Balanced (15 pts)</span>
                  </span>
                ) : (
                  <span className="text-rose-700 font-bold">Over Budget</span>
                )}
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-medium text-slate-700">Contingency Reserve &ge; 5%</span>
                {completeness.breakdown.contingencyFunded ? (
                  <span className="text-emerald-700 font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-4 h-4" /> <span>Funded (10 pts)</span>
                  </span>
                ) : (
                  <span className="text-amber-700 font-bold">Underfunded</span>
                )}
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-medium text-slate-700">Timeline Collision & Setup Clear</span>
                {completeness.breakdown.scheduleConflictFree ? (
                  <span className="text-emerald-700 font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-4 h-4" /> <span>Conflict-Free (20 pts)</span>
                  </span>
                ) : (
                  <span className="text-rose-700 font-bold">Conflicts Found</span>
                )}
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-medium text-slate-700">Risk & Safety Safeguards (Weather/Diet)</span>
                {completeness.breakdown.dietaryHandled && completeness.breakdown.weatherContingencyReady ? (
                  <span className="text-emerald-700 font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-4 h-4" /> <span>Prepared (20 pts)</span>
                  </span>
                ) : (
                  <span className="text-amber-700 font-bold">Partial Protection</span>
                )}
              </div>
            </div>

            {completeness.missingItems.length > 0 && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs">
                <strong className="block font-semibold mb-1">Recommended Next Actions:</strong>
                <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                  {completeness.missingItems.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowCompletenessModal(false)}
                className="px-4 py-2 bg-navy-900 text-white text-xs font-semibold rounded-lg"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
