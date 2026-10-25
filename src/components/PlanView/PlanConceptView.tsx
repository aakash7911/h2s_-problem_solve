import React, { useState } from 'react';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Tag,
  Calculator,
  UserCheck,
  ClipboardList,
} from 'lucide-react';
import { EventPlan } from '../../types/event';

interface PlanConceptViewProps {
  plan: EventPlan;
  onUpdatePlan: (updatedPlan: EventPlan) => void;
}

export const PlanConceptView: React.FC<PlanConceptViewProps> = ({ plan, onUpdatePlan }) => {
  const [expandedRecId, setExpandedRecId] = useState<string | null>(null);

  const { conceptRationale, recommendations, checklists, aiProviderUsed } = plan;

  const toggleChecklistItem = (sectionIndex: number, itemId: string) => {
    const updatedChecklists = [...checklists];
    const section = updatedChecklists[sectionIndex];
    if (section) {
      section.items = section.items.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );
      onUpdatePlan({
        ...plan,
        checklists: updatedChecklists,
      });
    }
  };

  const getOriginBadge = (originType: 'user_fact' | 'calculated_estimate' | 'ai_suggestion') => {
    switch (originType) {
      case 'user_fact':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <UserCheck className="w-3 h-3" />
            <span>USER FACT</span>
          </span>
        );
      case 'calculated_estimate':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Calculator className="w-3 h-3" />
            <span>CALCULATED ESTIMATE</span>
          </span>
        );
      case 'ai_suggestion':
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            <span>AI SUGGESTION</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header with Provenance Notice */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Strategic Event Architecture
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500">
                Engine: <strong className="text-slate-700">{aiProviderUsed || 'Deterministic Engine'}</strong>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-navy-900 mt-1">
              Concept, Rationale & Recommendations
            </h1>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            {getOriginBadge('user_fact')}
            {getOriginBadge('calculated_estimate')}
            {getOriginBadge('ai_suggestion')}
          </div>
        </div>

        {/* Concept Rationale Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center space-x-2 text-indigo-900 font-bold">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Theme & Atmosphere Concept</span>
              {getOriginBadge('ai_suggestion')}
            </div>
            <p className="text-slate-700 leading-relaxed text-xs sm:text-sm font-medium">
              {conceptRationale.atmosphereDescription}
            </p>
          </div>

          <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center space-x-2 text-navy-900 font-bold">
              <Tag className="w-4 h-4 text-slate-600" />
              <span>Attendee Group & Headcount Fit</span>
              {getOriginBadge('calculated_estimate')}
            </div>
            <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">
              {conceptRationale.targetAudienceFit}
            </p>
          </div>
        </div>

        {/* Success Factors */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Pivotal Execution Factors
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {conceptRationale.keySuccessFactors.map((factor, index) => (
              <div
                key={index}
                className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/30 flex items-start space-x-3 text-xs"
              >
                <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <span className="text-slate-800 leading-snug">{factor}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Personalized Recommendations with "Why this was suggested" */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-subtle space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-navy-900">Personalized Planning Recommendations</h2>
            <p className="text-xs text-slate-500">
              Each recommendation includes verifiable logic and impact assessment
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {recommendations.map((rec) => {
            const isExpanded = expandedRecId === rec.id;
            return (
              <div
                key={rec.id}
                className="rounded-xl border border-slate-200 overflow-hidden hover:border-slate-300 transition-colors"
              >
                <div
                  className="p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer"
                  onClick={() => setExpandedRecId(isExpanded ? null : rec.id)}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
                        {rec.category}
                      </span>
                      {getOriginBadge(rec.originType)}
                    </div>
                    <h3 className="text-sm font-bold text-navy-900">{rec.title}</h3>
                    <p className="text-xs text-slate-600">{rec.recommendation}</p>
                  </div>

                  <button
                    type="button"
                    className="self-start sm:self-center shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                    aria-label={isExpanded ? 'Collapse explanation' : 'Expand explanation'}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs space-y-2 animate-in fade-in">
                    <div>
                      <strong className="text-indigo-950 font-bold block mb-0.5">
                        💡 Why this was suggested:
                      </strong>
                      <p className="text-slate-700">{rec.rationale}</p>
                    </div>
                    <div>
                      <strong className="text-emerald-950 font-bold block mb-0.5">
                        📈 Measurable Impact:
                      </strong>
                      <p className="text-slate-700">{rec.impact}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Checklists: Venue, Catering, AV, Decor */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-subtle space-y-5">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <ClipboardList className="w-5 h-5 text-indigo-600" />
          <div>
            <h2 className="text-base font-bold text-navy-900">Execution Checklists & Verification</h2>
            <p className="text-xs text-slate-500">Track key logistical checkpoints before and on event day</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {checklists.map((section, sectionIdx) => {
            const completedCount = section.items.filter((i) => i.completed).length;
            return (
              <div
                key={section.title}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                  <h3 className="font-bold text-xs text-navy-900 uppercase tracking-wider">{section.title}</h3>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {completedCount} / {section.items.length} Checked
                  </span>
                </div>

                <div className="space-y-2">
                  {section.items.map((item) => (
                    <label
                      key={item.id}
                      className={`flex items-start space-x-2.5 p-2 rounded-lg cursor-pointer transition text-xs ${
                        item.completed ? 'bg-emerald-50/60 text-slate-500 line-through' : 'hover:bg-white text-slate-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => toggleChecklistItem(sectionIdx, item.id)}
                        className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 border-slate-300"
                      />
                      <span className="leading-snug flex-1">{item.text}</span>
                      {item.importance === 'essential' && (
                        <span className="text-[9px] uppercase font-bold text-rose-600 bg-rose-50 px-1 py-0.5 rounded border border-rose-200 shrink-0">
                          Essential
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
