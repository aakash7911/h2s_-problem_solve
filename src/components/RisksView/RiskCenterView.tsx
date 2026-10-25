import React from 'react';
import {
  CloudRain,
  DollarSign,
  UtensilsCrossed,
  Accessibility,
  Clock,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { EventPlan, RiskItem } from '../../types/event';
import { identifyAssumptionsAndUncertainties } from '../../utils/riskEngine';

interface RiskCenterViewProps {
  plan: EventPlan;
}

export const RiskCenterView: React.FC<RiskCenterViewProps> = ({ plan }) => {
  const { risks, requirements, budget } = plan;

  const { assumptions, uncertainties } = identifyAssumptionsAndUncertainties(requirements);

  const getCategoryIcon = (category: RiskItem['category']) => {
    switch (category) {
      case 'weather':
        return <CloudRain className="w-4 h-4 text-sky-600" />;
      case 'budget':
        return <DollarSign className="w-4 h-4 text-rose-600" />;
      case 'dietary':
        return <UtensilsCrossed className="w-4 h-4 text-emerald-600" />;
      case 'accessibility':
        return <Accessibility className="w-4 h-4 text-indigo-600" />;
      case 'vendor':
      case 'schedule':
      default:
        return <Clock className="w-4 h-4 text-amber-600" />;
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 7) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-50 text-rose-700 border border-rose-200">
          High Severity ({score}/9)
        </span>
      );
    }
    if (score >= 4) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-50 text-amber-800 border border-amber-200">
          Moderate ({score}/9)
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
        Low ({score}/9)
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
                Resilience & Safeguards
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500">Continuous Risk Intelligence</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-navy-900 mt-1">
              Risk & Contingency Command Center
            </h1>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] text-slate-400 font-semibold block">Total Threats</span>
              <strong className="text-slate-800 text-sm">{risks.length} Scenarios</strong>
            </div>
            <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 text-center">
              <span className="text-[10px] text-indigo-500 font-semibold block">Protected By</span>
              <strong className="text-indigo-900 text-sm">
                {budget.currency} {budget.contingencyReserve.toLocaleString()}
              </strong>
            </div>
          </div>
        </div>

        {/* Outdoor Weather Alert If Applicable */}
        {requirements.venueType === 'outdoor' && (
          <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl flex items-start space-x-3 text-xs text-sky-950">
            <CloudRain className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block text-sm">
                Outdoor Venue Weather Contingency Required
              </strong>
              <p className="mt-0.5 text-sky-900">
                You selected an outdoor setting for {requirements.date}. Precipitation, wind gusts, and electronics
                short-circuit hazards require a designated rain-shelter call threshold 48 hours prior to guest arrival.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Risk Scenarios & Contingency Playbooks Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Prioritized Vulnerability Matrix & Contingencies
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {risks.map((risk) => (
            <div
              key={risk.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-subtle space-y-3.5 hover:border-slate-300 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                    {getCategoryIcon(risk.category)}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      {risk.category} Risk
                    </span>
                    <h3 className="font-bold text-navy-900 text-sm">{risk.title}</h3>
                  </div>
                </div>
                {getScoreBadge(risk.riskScore)}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{risk.description}</p>

              {/* Actionable Playbook */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
                <div className="text-indigo-950 font-bold flex items-center space-x-1.5 text-[11px]">
                  <span>🛡️ Actionable Contingency Playbook:</span>
                </div>
                <p className="text-slate-700 text-[11px] leading-snug">{risk.contingencyPlan}</p>
                <div className="pt-1 text-[10px] text-slate-500 border-t border-slate-200/60 mt-1">
                  <strong>Immediate Step:</strong> {risk.actionRequired}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Assumptions & Uncertainties Ledger */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Underlying Assumptions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-subtle space-y-3 text-xs">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-navy-900">Planning Baseline Assumptions</h3>
          </div>
          <ul className="space-y-2 text-slate-600">
            {assumptions.map((assump, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span>{assump}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Known Uncertainties */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-subtle space-y-3 text-xs">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-navy-900">Uncertainties & Variables Under Surveillance</h3>
          </div>
          <ul className="space-y-2 text-slate-600">
            {uncertainties.map((uncert, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>{uncert}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
