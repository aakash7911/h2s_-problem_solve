import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navigation/Navbar';
import { DashboardView } from './components/Dashboard/DashboardView';
import { PlanConceptView } from './components/PlanView/PlanConceptView';
import { BudgetManagementView } from './components/BudgetView/BudgetManagementView';
import { TimelineManagementView } from './components/TimelineView/TimelineManagementView';
import { VendorComparisonView } from './components/VendorsView/VendorComparisonView';
import { RiskCenterView } from './components/RisksView/RiskCenterView';
import { SavedPlansAndSimulatorView } from './components/SavedPlansView/SavedPlansAndSimulatorView';
import { EventWizard } from './components/Wizard/EventWizard';
import { ExportModal } from './components/ExportModal';
import { EventPlan, EventRequirements } from './types/event';
import {
  loadSavedPlans,
  savePlans,
  getActivePlanId,
  setActivePlanId,
  createPlanFromRequirements,
} from './utils/storage';

export const App: React.FC = () => {
  const [plans, setPlans] = useState<EventPlan[]>([]);
  const [activePlanId, setActiveId] = useState<string>('');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Backend / AI Status
  const [isLiveAI, setIsLiveAI] = useState<boolean>(false);
  const [aiProvider, setAiProvider] = useState<string>('deterministic_engine');

  // Initialize and load saved plans
  useEffect(() => {
    const loaded = loadSavedPlans();
    setPlans(loaded);

    const storedActiveId = getActivePlanId();
    if (storedActiveId && loaded.some((p) => p.id === storedActiveId)) {
      setActiveId(storedActiveId);
    } else if (loaded.length > 0) {
      setActiveId(loaded[0].id);
      setActivePlanId(loaded[0].id);
    }

    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setIsLiveAI(data.mode === 'live_ai');
        setAiProvider(data.provider || 'deterministic_engine');
      })
      .catch(() => {
        setIsLiveAI(false);
        setAiProvider('client_deterministic_engine');
      });
  }, []);

  const activePlan = plans.find((p) => p.id === activePlanId) || plans[0];

  const handleSelectPlan = (planId: string) => {
    setActiveId(planId);
    setActivePlanId(planId);
  };

  const handleUpdateActivePlan = (updatedPlan: EventPlan) => {
    const updated = plans.map((p) => (p.id === updatedPlan.id ? updatedPlan : p));
    setPlans(updated);
    savePlans(updated);
  };

  const handleDeletePlan = (planId: string) => {
    if (plans.length <= 1) return;
    const filtered = plans.filter((p) => p.id !== planId);
    setPlans(filtered);
    savePlans(filtered);
    if (activePlanId === planId) {
      setActiveId(filtered[0].id);
      setActivePlanId(filtered[0].id);
    }
  };

  const handleDuplicatePlan = (planToDup: EventPlan) => {
    const duplicated: EventPlan = {
      ...planToDup,
      id: `plan-${Date.now()}`,
      requirements: {
        ...planToDup.requirements,
        id: `plan-${Date.now()}`,
        title: `${planToDup.requirements.title} (Copy)`,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [duplicated, ...plans];
    setPlans(updated);
    savePlans(updated);
    setActiveId(duplicated.id);
    setActivePlanId(duplicated.id);
  };

  const handleCreatePlanFromWizard = async (requirements: EventRequirements) => {
    setIsGenerating(true);
    try {
      // Attempt backend AI endpoint (uses GEMINI_API_KEY from Render environment)
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requirements),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.plan) {
          const newPlan: EventPlan = data.plan;
          const updated = [newPlan, ...plans];
          setPlans(updated);
          savePlans(updated);
          setActiveId(newPlan.id);
          setActivePlanId(newPlan.id);
          setIsWizardOpen(false);
          setCurrentTab('plan'); // Navigate to generated plan
          setIsGenerating(false);
          return;
        }
      }
    } catch {
      // Server unavailable, fall through to client deterministic generation
    }

    // Client-side deterministic fallback
    const fallbackPlan = createPlanFromRequirements(requirements, false, 'deterministic_engine');
    const updated = [fallbackPlan, ...plans];
    setPlans(updated);
    savePlans(updated);
    setActiveId(fallbackPlan.id);
    setActivePlanId(fallbackPlan.id);
    setIsWizardOpen(false);
    setCurrentTab('plan');
    setIsGenerating(false);
  };

  if (!activePlan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-600">Initializing EventWise AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navigation */}
      <div className="no-print">
        <Navbar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          activePlan={activePlan}
          savedPlans={plans}
          onSelectPlan={handleSelectPlan}
          onOpenWizard={() => setIsWizardOpen(true)}
          onOpenExportModal={() => setIsExportOpen(true)}
          isLiveAI={isLiveAI}
          aiProvider={aiProvider}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            plan={activePlan}
            onNavigate={setCurrentTab}
            onOpenWizard={() => setIsWizardOpen(true)}
          />
        )}

        {currentTab === 'plan' && (
          <PlanConceptView plan={activePlan} onUpdatePlan={handleUpdateActivePlan} />
        )}

        {currentTab === 'budget' && (
          <BudgetManagementView plan={activePlan} onUpdatePlan={handleUpdateActivePlan} />
        )}

        {currentTab === 'timeline' && (
          <TimelineManagementView plan={activePlan} onUpdatePlan={handleUpdateActivePlan} />
        )}

        {currentTab === 'vendors' && (
          <VendorComparisonView plan={activePlan} onUpdatePlan={handleUpdateActivePlan} />
        )}

        {currentTab === 'risks' && (
          <RiskCenterView plan={activePlan} />
        )}

        {currentTab === 'saved' && (
          <SavedPlansAndSimulatorView
            activePlan={activePlan}
            savedPlans={plans}
            onSelectPlan={handleSelectPlan}
            onDeletePlan={handleDeletePlan}
            onDuplicatePlan={handleDuplicatePlan}
            onOpenWizard={() => setIsWizardOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-navy-900">EventWise AI</span>
            <span>—</span>
            <span>PromptWars Challenge 5: Celebration & Event Planner</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Engineered with strict deterministic constraint checking & generative AI framing.
          </div>
        </div>
      </footer>

      {/* Event Creation Wizard Modal */}
      <EventWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onPlanCreated={handleCreatePlanFromWizard}
        isGenerating={isGenerating}
      />

      {/* Export Brief Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        plan={activePlan}
      />
    </div>
  );
};
