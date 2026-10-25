import React, { useState } from 'react';
import {
  Sparkles,
  Calendar,
  DollarSign,
  Clock,
  Users,
  ShieldAlert,
  FolderOpen,
  PlusCircle,
  FileText,
  Info,
  ChevronDown,
} from 'lucide-react';
import { EventPlan } from '../../types/event';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  activePlan: EventPlan;
  savedPlans: EventPlan[];
  onSelectPlan: (planId: string) => void;
  onOpenWizard: () => void;
  onOpenExportModal: () => void;
  isLiveAI: boolean;
  aiProvider: string;
  onSaveApiKey?: (key: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  activePlan,
  savedPlans,
  onSelectPlan,
  onOpenWizard,
  onOpenExportModal,
  isLiveAI,
  aiProvider,
  onSaveApiKey,
}) => {
  const [showPlanMenu, setShowPlanMenu] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => localStorage.getItem('gemini_custom_api_key') || '');
  const [keySavedMessage, setKeySavedMessage] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Calendar },
    { id: 'plan', label: 'AI Plan Concept', icon: Sparkles },
    { id: 'budget', label: 'Budget & Expenses', icon: DollarSign },
    { id: 'timeline', label: 'Timeline & Tasks', icon: Clock },
    { id: 'vendors', label: 'Vendor Matrix', icon: Users },
    { id: 'risks', label: 'Risk Center', icon: ShieldAlert },
    { id: 'saved', label: 'Saved & Simulator', icon: FolderOpen },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-subtle backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-navy-800 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <Sparkles className="w-5 h-5 text-indigo-100" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-navy-900 tracking-tight text-lg">EventWise</span>
                  <span className="text-xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    AI
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium hidden sm:block">Intelligent Celebration Planner</p>
              </div>
            </div>

            {/* Active Plan Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowPlanMenu(!showPlanMenu)}
                className="flex items-center space-x-2 text-left px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50/70 hover:bg-slate-100 transition-colors text-xs sm:text-sm font-medium text-navy-900"
                aria-expanded={showPlanMenu}
                aria-haspopup="true"
              >
                <div className="max-w-[130px] sm:max-w-[200px] truncate">
                  <span className="text-slate-400 mr-1 text-xs">Plan:</span>
                  <span className="font-semibold text-slate-800">{activePlan.requirements.title || 'Untitled Event'}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </button>

              {showPlanMenu && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white shadow-elevated border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Switch Saved Plan
                  </div>
                  {savedPlans.map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => {
                        onSelectPlan(plan.id);
                        setShowPlanMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                        plan.id === activePlan.id ? 'bg-indigo-50/80 text-indigo-900 font-semibold' : 'text-slate-700'
                      }`}
                    >
                      <span className="truncate">{plan.requirements.title}</span>
                      <span className="text-[10px] text-slate-400 capitalize shrink-0 ml-2">
                        {plan.requirements.eventType.replace('_', ' ')}
                      </span>
                    </button>
                  ))}
                  <div className="border-t border-slate-100 my-1 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPlanMenu(false);
                        onOpenWizard();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-indigo-600 font-semibold hover:bg-indigo-50 flex items-center space-x-2"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Create New Plan</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* AI Engine Status & Quick Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setShowAiModal(true)}
                className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                  isLiveAI
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                }`}
                title="Click for engine details"
              >
                <span
                  className={`w-2 h-2 rounded-full animate-pulse ${isLiveAI ? 'bg-emerald-500' : 'bg-amber-500'}`}
                />
                <span className="hidden md:inline">{isLiveAI ? `Live AI (${aiProvider})` : 'Demo Engine Mode'}</span>
                <span className="md:hidden">{isLiveAI ? 'AI' : 'Demo'}</span>
                <Info className="w-3 h-3 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={onOpenExportModal}
                className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                title="Export or print event brief"
              >
                <FileText className="w-4 h-4 text-slate-500" />
                <span>Export Brief</span>
              </button>

              <button
                type="button"
                onClick={onOpenWizard}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">New Plan</span>
                <span className="sm:hidden">New</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-100" aria-label="Tabs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-navy-900 text-white shadow-subtle'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-300' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* AI Engine Status Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-elevated border border-slate-200 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isLiveAI ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-navy-900 text-base">
                    {isLiveAI ? 'Live Generative AI Active' : 'Deterministic Demo Mode Active'}
                  </h3>
                  <p className="text-xs text-slate-500">EventWise AI Engine Transparency</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none p-1"
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <p>
                <strong className="text-slate-800">Current Provider:</strong>{' '}
                <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">
                  {aiProvider}
                </span>
              </p>
              <p>
                <strong className="text-slate-800">Deployment Status:</strong>{' '}
                <span className="font-semibold text-indigo-700">
                  {isLiveAI ? 'Live Gemini AI Active' : 'Deterministic Engine (Demo Mode)'}
                </span>
              </p>
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <label className="block text-[11px] font-bold text-slate-700">
                  Configure Google Gemini API Key (Optional / Deploy on Render):
                </label>
                <div className="flex space-x-1.5">
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="AIzaSy... (Paste Gemini API Key)"
                    className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-600 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.setItem('gemini_custom_api_key', apiKeyInput.trim());
                      if (onSaveApiKey) onSaveApiKey(apiKeyInput.trim());
                      setKeySavedMessage(true);
                      setTimeout(() => setKeySavedMessage(false), 2500);
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs"
                  >
                    Save Key
                  </button>
                </div>
                {keySavedMessage && (
                  <p className="text-[11px] text-emerald-600 font-bold">✓ Key saved to browser!</p>
                )}
                <p className="text-[10px] text-slate-400 leading-tight">
                  For Render deployment: Set <code className="bg-slate-200 px-1 py-0.2 rounded font-mono">GEMINI_API_KEY</code> in Render's Environment Variables dashboard.
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
