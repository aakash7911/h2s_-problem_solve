import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Calendar,
  DollarSign,
  Users,
  MapPin,
  Loader2,
} from 'lucide-react';
import {
  EventRequirements,
  EventType,
  Currency,
  PlanningPriority,
  VenueType,
} from '../../types/event';

interface EventWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanCreated: (requirements: EventRequirements) => Promise<void>;
  isGenerating: boolean;
}

const EVENT_TYPES: { id: EventType; label: string; icon: string; desc: string }[] = [
  { id: 'birthday', label: 'Birthday Celebration', icon: '🎂', desc: 'Milestones, kids parties, & adult lounge celebrations' },
  { id: 'wedding', label: 'Wedding & Reception', icon: '💍', desc: 'Ceremonies, dinners, and anniversary galas' },
  { id: 'college_festival', label: 'College / Tech Fest', icon: '🎸', desc: 'Campus fests, hackathons, and concerts' },
  { id: 'family_gathering', label: 'Family Reunion', icon: '🏡', desc: 'Multi-generational meals and milestone anniversaries' },
  { id: 'community_event', label: 'Community & Charity', icon: '🤝', desc: 'Neighborhood fairs, fund-raisers, and cultural days' },
  { id: 'corporate_social', label: 'Corporate Social', icon: '🏢', desc: 'Team offsites, galas, and product launch celebrations' },
];

const CURRENCIES: Currency[] = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'];

const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Halal',
  'Kosher',
  'Nut Allergy Safe',
  'Dairy-Free',
  'Pescatarian',
];

const ACCESSIBILITY_OPTIONS = [
  'Step-Free / Wheelchair Ramps',
  'Ground Floor Restrooms',
  'Wide Doorways (min 36 in)',
  'Assisted Listening / Hearing Loop',
  'Designated Accessible Parking',
  'Quiet Sensory Decompression Space',
];

export const EventWizard: React.FC<EventWizardProps> = ({
  isOpen,
  onClose,
  onPlanCreated,
  isGenerating,
}) => {
  const [step, setStep] = useState<number>(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<EventRequirements>({
    id: `plan-${Date.now()}`,
    title: '',
    eventType: 'birthday',
    date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    startTime: '18:00',
    durationHours: 4,
    guestCount: 40,
    totalBudget: 4000,
    currency: 'USD',
    location: '',
    theme: '',
    venueType: 'indoor',
    venueName: '',
    dietaryRequirements: ['Vegetarian'],
    accessibilityRequirements: ['Step-Free / Wheelchair Ramps'],
    mustHaveActivities: ['Welcome Reception', 'Cake / Toast Ceremony'],
    optionalFeatures: ['Photobooth Station'],
    priority: 'balanced',
    riskTolerance: 'moderate',
    contingencyPercentage: 10,
    notes: '',
  });

  const [newActivityInput, setNewActivityInput] = useState('');

  if (!isOpen) return null;

  const handleNext = () => {
    setErrorMsg(null);
    if (step === 1) {
      if (!formData.title.trim()) {
        setErrorMsg('Please enter a descriptive title for your celebration.');
        return;
      }
      if (!formData.location.trim()) {
        setErrorMsg('Please provide a general location or city (e.g., "Seattle, WA").');
        return;
      }
      if (formData.guestCount <= 0) {
        setErrorMsg('Guest count must be at least 1 attendee.');
        return;
      }
    } else if (step === 2) {
      if (formData.totalBudget < 100) {
        setErrorMsg('Total budget must be at least 100 in your selected currency.');
        return;
      }
    }
    setStep((prev) => Math.min(4, prev + 1));
  };

  const handleBack = () => {
    setErrorMsg(null);
    setStep((prev) => Math.max(1, prev - 1));
  };

  const toggleDietary = (item: string) => {
    setFormData((prev) => ({
      ...prev,
      dietaryRequirements: prev.dietaryRequirements.includes(item)
        ? prev.dietaryRequirements.filter((d) => d !== item)
        : [...prev.dietaryRequirements, item],
    }));
  };

  const toggleAccessibility = (item: string) => {
    setFormData((prev) => ({
      ...prev,
      accessibilityRequirements: prev.accessibilityRequirements.includes(item)
        ? prev.accessibilityRequirements.filter((a) => a !== item)
        : [...prev.accessibilityRequirements, item],
    }));
  };

  const addCustomActivity = () => {
    if (!newActivityInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      mustHaveActivities: [...prev.mustHaveActivities, newActivityInput.trim()],
    }));
    setNewActivityInput('');
  };

  const removeActivity = (activity: string) => {
    setFormData((prev) => ({
      ...prev,
      mustHaveActivities: prev.mustHaveActivities.filter((a) => a !== activity),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await onPlanCreated(formData);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to generate plan. Please verify inputs.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
        {/* Wizard Header */}
        <div className="bg-gradient-to-r from-navy-900 to-indigo-900 p-6 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-bold">New Celebration Plan</h2>
                <p className="text-xs text-indigo-200">Constraint-Aware Intelligent Setup</p>
              </div>
            </div>
            {!isGenerating && (
              <button
                type="button"
                onClick={onClose}
                className="text-white/60 hover:text-white text-xl leading-none"
                aria-label="Close wizard"
              >
                &times;
              </button>
            )}
          </div>

          {/* Stepper Dots */}
          <div className="grid grid-cols-4 gap-2 mt-6">
            {[
              { num: 1, label: 'Basics' },
              { num: 2, label: 'Budget' },
              { num: 3, label: 'Preferences' },
              { num: 4, label: 'Review & AI' },
            ].map((s) => (
              <div key={s.num} className="text-left">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    step >= s.num ? 'bg-indigo-400' : 'bg-white/20'
                  }`}
                />
                <span
                  className={`text-[11px] font-medium block mt-1 ${
                    step === s.num ? 'text-white font-semibold' : 'text-white/50'
                  }`}
                >
                  {s.num}. {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Wizard Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Step 1: Basics */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Event Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {EVENT_TYPES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, eventType: t.id })}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        formData.eventType === t.id
                          ? 'border-indigo-600 bg-indigo-50/70 shadow-sm ring-1 ring-indigo-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xl mb-1">{t.icon}</div>
                      <div className="text-xs font-bold text-navy-900 leading-tight">{t.label}</div>
                      <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Event Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Jordan's 30th Rooftop Sunset Celebration"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Date</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time & Duration</label>
                  <div className="flex space-x-2">
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-1/2 px-2 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                    <select
                      value={formData.durationHours}
                      onChange={(e) => setFormData({ ...formData, durationHours: parseInt(e.target.value, 10) })}
                      className="w-1/2 px-2 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    >
                      <option value={2}>2 Hours</option>
                      <option value={3}>3 Hours</option>
                      <option value={4}>4 Hours</option>
                      <option value={5}>5 Hours</option>
                      <option value={6}>6 Hours</option>
                      <option value={8}>8 Hours (Full Day)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Expected Guests <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="number"
                      min={1}
                      max={5000}
                      value={formData.guestCount}
                      onChange={(e) => setFormData({ ...formData, guestCount: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City / General Location <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. Austin, TX or Campus Grounds"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Budget & Financial Safety */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Total Available Budget <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="number"
                      min={100}
                      step={50}
                      value={formData.totalBudget}
                      onChange={(e) => setFormData({ ...formData, totalBudget: Math.max(100, parseInt(e.target.value, 10) || 100) })}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value as Currency })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Per-Guest Budget Preview */}
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500">Calculated Budget Per Guest:</span>
                  <p className="font-bold text-navy-900 text-sm">
                    {formData.currency} {Math.round(formData.totalBudget / Math.max(1, formData.guestCount))}
                    <span className="text-slate-400 font-normal text-xs"> / attendee</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-slate-500">Emergency Reserve ({formData.contingencyPercentage}%):</span>
                  <p className="font-semibold text-indigo-700 text-xs">
                    {formData.currency} {Math.round(formData.totalBudget * (formData.contingencyPercentage / 100))}
                  </p>
                </div>
              </div>

              {/* Contingency Reserve Slider */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <label className="font-semibold text-slate-700">Safety Contingency Reserve</label>
                  <span className="font-bold text-indigo-600">{formData.contingencyPercentage}% of budget</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={25}
                  step={1}
                  value={formData.contingencyPercentage}
                  onChange={(e) => setFormData({ ...formData, contingencyPercentage: parseInt(e.target.value, 10) })}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Recommended: 10%–15% for unexpected guest surges, vendor overtime, or delivery taxes.
                </p>
              </div>

              {/* Planning Priorities */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Planning Priority</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'balanced', label: 'Balanced Experience', desc: 'Equal emphasis on budget & guest satisfaction' },
                    { id: 'budget_strict', label: 'Strict Budget Cap', desc: 'Prioritize lowest costs & maximum savings' },
                    { id: 'experience_first', label: 'Experience & Ambiance', desc: 'Focus on memorable food, sound, & decor' },
                    { id: 'stress_free', label: 'Low Stress & Turnkey', desc: 'Minimize DIY tasks with full-service vendors' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: p.id as PlanningPriority })}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        formData.priority === p.id
                          ? 'border-indigo-600 bg-indigo-50/70 font-semibold'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-slate-800">{p.label}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Preferences & Constraints */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Theme / Atmosphere</label>
                  <input
                    type="text"
                    value={formData.theme}
                    onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                    placeholder="e.g. Bohemian Garden or Modern Retro Synth"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Venue Setting</label>
                  <select
                    value={formData.venueType}
                    onChange={(e) => setFormData({ ...formData, venueType: e.target.value as VenueType })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  >
                    <option value="indoor">Indoor (Climate Controlled)</option>
                    <option value="outdoor">Outdoor (Weather Dependent)</option>
                    <option value="hybrid">Hybrid (Indoor + Lawn/Patio)</option>
                    <option value="undecided">Undecided / Scouting</option>
                  </select>
                </div>
              </div>

              {/* Dietary Requirements */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Dietary & Allergen Accommodations</label>
                <div className="flex flex-wrap gap-1.5">
                  {DIETARY_OPTIONS.map((item) => {
                    const isSelected = formData.dietaryRequirements.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleDietary(item)}
                        className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
                          isSelected
                            ? 'bg-indigo-600 text-white font-medium shadow-sm'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}{item}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Accessibility Requirements */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Physical Accessibility Accommodations</label>
                <div className="flex flex-wrap gap-1.5">
                  {ACCESSIBILITY_OPTIONS.map((item) => {
                    const isSelected = formData.accessibilityRequirements.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleAccessibility(item)}
                        className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
                          isSelected
                            ? 'bg-emerald-600 text-white font-medium shadow-sm'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}{item}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Must-Have Activities */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Must-Have Activities & Spotlight Moments</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {formData.mustHaveActivities.map((act) => (
                    <span
                      key={act}
                      className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs"
                    >
                      <span>{act}</span>
                      <button
                        type="button"
                        onClick={() => removeActivity(act)}
                        className="text-indigo-400 hover:text-indigo-700 font-bold ml-1"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newActivityInput}
                    onChange={(e) => setNewActivityInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomActivity();
                      }
                    }}
                    placeholder="Add activity (e.g. Trivia Quiz, Karaoke, Fireworks)"
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  />
                  <button
                    type="button"
                    onClick={addCustomActivity}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review & Formulate AI Plan */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 bg-indigo-50/60 border border-indigo-200/80 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                  <div>
                    <h3 className="text-sm font-bold text-navy-900">{formData.title}</h3>
                    <p className="text-xs text-indigo-800 capitalize">
                      {formData.eventType.replace('_', ' ')} • {formData.location}
                    </p>
                  </div>
                  <span className="text-xs font-extrabold text-indigo-700 bg-white px-2 py-1 rounded shadow-sm border border-indigo-100">
                    {formData.currency} {formData.totalBudget.toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Date & Time</span>
                    <span className="font-semibold text-slate-800">{formData.date} @ {formData.startTime}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Headcount</span>
                    <span className="font-semibold text-slate-800">{formData.guestCount} Attendees</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Setting</span>
                    <span className="font-semibold text-slate-800 capitalize">{formData.venueType}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Contingency</span>
                    <span className="font-semibold text-slate-800">{formData.contingencyPercentage}% Reserve</span>
                  </div>
                </div>

                {formData.dietaryRequirements.length > 0 && (
                  <div className="text-xs pt-1 border-t border-indigo-100/60">
                    <span className="text-slate-500 text-[10px] block">Dietary Inclusions</span>
                    <span className="text-slate-700">{formData.dietaryRequirements.join(', ')}</span>
                  </div>
                )}
              </div>

              {/* Planning Engine Notice */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start space-x-2.5 text-xs text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800">Deterministic + AI Pipeline:</strong>
                  <p className="text-[11px] mt-0.5">
                    Budget mathematics and schedule conflicts will be calculated deterministically with hard constraints.
                    EventWise AI will synthesize custom concept rationales and mitigation playbooks.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Wizard Footer Controls */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={isGenerating}
                className="inline-flex items-center space-x-1.5 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isGenerating}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-bold rounded-lg shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Plan...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Intelligent Plan</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
