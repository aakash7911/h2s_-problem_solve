import React, { useState } from 'react';
import {
  Star,
  AlertCircle,
  Sliders,
  Plus,
} from 'lucide-react';
import { EventPlan, VendorItem, ExpenseCategory } from '../../types/event';
import {
  calculateVendorScore,
  DEFAULT_VENDOR_WEIGHTS,
  VendorWeights,
} from '../../utils/vendorEngine';
import { CATEGORY_LABELS } from '../../utils/budgetEngine';

interface VendorComparisonViewProps {
  plan: EventPlan;
  onUpdatePlan: (updatedPlan: EventPlan) => void;
}

export const VendorComparisonView: React.FC<VendorComparisonViewProps> = ({
  plan,
  onUpdatePlan,
}) => {
  const { vendors, budget, requirements } = plan;

  // Selected Category Filter
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Weights Controller State
  const [showWeightsConfig, setShowWeightsConfig] = useState(false);
  const [weights, setWeights] = useState<VendorWeights>(DEFAULT_VENDOR_WEIGHTS);

  // Add Custom Quote State
  const [showAddQuoteModal, setShowAddQuoteModal] = useState(false);
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorCategory, setNewVendorCategory] = useState<ExpenseCategory>('venue');
  const [newVendorPrice, setNewVendorPrice] = useState(1200);
  const [newVendorRating, setNewVendorRating] = useState(4.7);
  const [newVendorAvailability, setNewVendorAvailability] = useState<VendorItem['availability']>('high');
  const [newVendorAccessibility, setNewVendorAccessibility] = useState(true);
  const [newVendorPros, setNewVendorPros] = useState('Great customer reviews, flexible policies');
  const [newVendorCons, setNewVendorCons] = useState('Requires 50% deposit');

  const filteredVendors = selectedCategory === 'all'
    ? vendors
    : vendors.filter((v) => v.category === selectedCategory);

  const getCatBudget = (cat: ExpenseCategory) => {
    const alloc = budget.categoryAllocations.find((a) => a.category === cat);
    return alloc ? alloc.allocatedBudget : Math.round(budget.totalBudget * 0.2);
  };

  const handleWeightChange = (key: keyof VendorWeights, val: number) => {
    const updatedWeights = { ...weights, [key]: val };
    setWeights(updatedWeights);

    // Recalculate scores for all vendors
    const updatedVendors = vendors.map((v) => {
      const { score, tradeOffSummary } = calculateVendorScore(
        v,
        getCatBudget(v.category),
        requirements.guestCount,
        requirements.accessibilityRequirements.length > 0,
        updatedWeights
      );
      return {
        ...v,
        suitabilityScore: score,
        tradeOffSummary,
      };
    });

    onUpdatePlan({
      ...plan,
      vendors: updatedVendors,
    });
  };

  const handleSelectVendor = (vendorId: string) => {
    const updatedVendors = vendors.map((v) => {
      if (v.id === vendorId) {
        return { ...v, selected: !v.selected };
      }
      return v;
    });

    onUpdatePlan({
      ...plan,
      vendors: updatedVendors,
    });
  };

  const handleAddCustomVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendorName.trim()) return;

    const rawVendor: Omit<VendorItem, 'suitabilityScore' | 'tradeOffSummary'> = {
      id: `custom-vendor-${Date.now()}`,
      category: newVendorCategory,
      name: `${newVendorName.trim()} [CUSTOM QUOTE]`,
      isDemoRecord: true,
      estimatedPrice: newVendorPrice,
      rating: newVendorRating,
      availability: newVendorAvailability,
      accessibilitySupport: newVendorAccessibility,
      pros: newVendorPros.split(',').map((p) => p.trim()).filter(Boolean),
      cons: newVendorCons.split(',').map((c) => c.trim()).filter(Boolean),
      selected: false,
    };

    const { score, tradeOffSummary } = calculateVendorScore(
      rawVendor,
      getCatBudget(newVendorCategory),
      requirements.guestCount,
      requirements.accessibilityRequirements.length > 0,
      weights
    );

    const completeVendor: VendorItem = {
      ...rawVendor,
      suitabilityScore: score,
      tradeOffSummary,
    };

    onUpdatePlan({
      ...plan,
      vendors: [...vendors, completeVendor],
    });

    setNewVendorName('');
    setShowAddQuoteModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header & Transparency Notice */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Decision Matrix & Evaluation
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500">Multi-Criteria Weighted Engine</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-navy-900 mt-1">
              Vendor Comparison & Suitability
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowWeightsConfig(!showWeightsConfig)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              <span>Adjust Criteria Weights</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAddQuoteModal(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Quote</span>
            </button>
          </div>
        </div>

        {/* Demo Record Transparency Notice (Crucial Promptwars Requirement) */}
        <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start space-x-3 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5 leading-relaxed">
            <strong className="font-semibold block">Demonstration Records Notice:</strong>
            <p className="text-[11px] text-amber-800">
              Sample vendor records below are synthetic models demonstrating our transparent ranking logic.
              EventWise AI never fabricates real-world contracts, quotations, or reviews. Always request written binding
              proposals directly from verified local suppliers.
            </p>
          </div>
        </div>

        {/* Weighted Criteria Config Slider Drawer */}
        {showWeightsConfig && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs animate-in fade-in">
            <div className="flex items-center justify-between">
              <strong className="text-navy-900 font-bold">Multi-Criteria Ranking Weights</strong>
              <span className="text-[11px] text-slate-500">Total Influence Distribution</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                  <span>Price vs Budget</span>
                  <span>{Math.round(weights.price * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={0.6}
                  step={0.05}
                  value={weights.price}
                  onChange={(e) => handleWeightChange('price', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                  <span>Review Quality</span>
                  <span>{Math.round(weights.rating * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={0.5}
                  step={0.05}
                  value={weights.rating}
                  onChange={(e) => handleWeightChange('rating', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                  <span>Availability</span>
                  <span>{Math.round(weights.availability * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={0.4}
                  step={0.05}
                  value={weights.availability}
                  onChange={(e) => handleWeightChange('availability', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                  <span>Accessibility</span>
                  <span>{Math.round(weights.accessibility * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.05}
                  max={0.3}
                  step={0.05}
                  value={weights.accessibility}
                  onChange={(e) => handleWeightChange('accessibility', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* Category Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none pt-1">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedCategory === 'all'
                ? 'bg-navy-900 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            All Categories ({vendors.length})
          </button>
          {['venue', 'catering', 'entertainment', 'photography'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                selectedCategory === cat
                  ? 'bg-navy-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {CATEGORY_LABELS[cat as ExpenseCategory] || cat}
            </button>
          ))}
        </div>
      </div>

      {/* Vendor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredVendors.map((vendor) => {
          const categoryBudget = getCatBudget(vendor.category);
          const isUnderBudget = vendor.estimatedPrice <= categoryBudget;

          return (
            <div
              key={vendor.id}
              className={`rounded-2xl border p-5 shadow-subtle flex flex-col justify-between transition-all bg-white ${
                vendor.selected ? 'ring-2 ring-indigo-600 border-indigo-600 bg-indigo-50/20' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-3">
                {/* Top Badge & Rating Row */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {CATEGORY_LABELS[vendor.category] || vendor.category}
                      </span>
                      {vendor.isDemoRecord && (
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200">
                          Demo Record
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-navy-900">{vendor.name}</h3>
                  </div>

                  {/* Suitability Score Pill */}
                  <div className="text-right shrink-0">
                    <div className="inline-flex items-baseline space-x-1 px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-900 border border-indigo-200">
                      <span className="text-xs text-indigo-500 font-semibold">Match:</span>
                      <span className="text-base font-extrabold">{vendor.suitabilityScore}</span>
                      <span className="text-[10px] text-indigo-400">/100</span>
                    </div>
                  </div>
                </div>

                {/* Pricing & Key Metrics */}
                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Estimated Quote</span>
                    <span className="font-extrabold text-navy-900">
                      {budget.currency} {vendor.estimatedPrice.toLocaleString()}
                    </span>
                    <span
                      className={`text-[9px] block font-bold ${
                        isUnderBudget ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isUnderBudget
                        ? `Under budget by ${budget.currency} ${Math.abs(categoryBudget - vendor.estimatedPrice)}`
                        : `Over budget by ${budget.currency} ${Math.abs(vendor.estimatedPrice - categoryBudget)}`}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Rating</span>
                    <div className="flex items-center space-x-1 font-bold text-slate-800">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{vendor.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-[9px] text-slate-400">Demonstration score</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Accessibility</span>
                    <span
                      className={`text-[11px] font-bold ${
                        vendor.accessibilitySupport ? 'text-emerald-700' : 'text-slate-400'
                      }`}
                    >
                      {vendor.accessibilitySupport ? '✓ Supported' : 'Limited'}
                    </span>
                  </div>
                </div>

                {/* Trade-Off Summary */}
                <div className="text-xs p-2.5 bg-indigo-50/40 rounded-lg border border-indigo-100 text-slate-700">
                  <strong className="text-indigo-900 font-semibold block text-[11px] mb-0.5">
                    Evaluator Trade-Off Analysis:
                  </strong>
                  <p className="text-[11px] text-slate-600 leading-snug">{vendor.tradeOffSummary}</p>
                </div>

                {/* Pros & Cons */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <strong className="text-emerald-800 font-semibold block mb-1">Pros:</strong>
                    <ul className="space-y-0.5 text-slate-600">
                      {vendor.pros.map((p, idx) => (
                        <li key={idx}>+ {p}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong className="text-rose-800 font-semibold block mb-1">Cons & Caveats:</strong>
                    <ul className="space-y-0.5 text-slate-600">
                      {vendor.cons.map((c, idx) => (
                        <li key={idx}>- {c}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Selection Button */}
              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Status: {vendor.selected ? 'Selected Candidate' : 'Comparison Only'}
                </span>
                <button
                  type="button"
                  onClick={() => handleSelectVendor(vendor.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    vendor.selected
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {vendor.selected ? '✓ Preferred Vendor' : 'Select Vendor'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Quote Modal */}
      {showAddQuoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-elevated border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-navy-900 text-sm">Add Real/Custom Vendor Quote</h3>
              <button
                type="button"
                onClick={() => setShowAddQuoteModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddCustomVendor} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Vendor / Business Name</label>
                <input
                  type="text"
                  value={newVendorName}
                  onChange={(e) => setNewVendorName(e.target.value)}
                  placeholder="e.g. City Sound & Stage Rentals"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newVendorCategory}
                    onChange={(e) => setNewVendorCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-2 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  >
                    {['venue', 'catering', 'entertainment', 'photography', 'equipment'].map((c) => (
                      <option key={c} value={c}>{CATEGORY_LABELS[c as ExpenseCategory] || c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quote Price ({budget.currency})</label>
                  <input
                    type="number"
                    min={0}
                    value={newVendorPrice}
                    onChange={(e) => setNewVendorPrice(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estimated Rating (1-5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    step={0.1}
                    value={newVendorRating}
                    onChange={(e) => setNewVendorRating(parseFloat(e.target.value) || 4.5)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Availability</label>
                  <select
                    value={newVendorAvailability}
                    onChange={(e) => setNewVendorAvailability(e.target.value as VendorItem['availability'])}
                    className="w-full px-2 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  >
                    <option value="high">High (Dates Open)</option>
                    <option value="medium">Medium</option>
                    <option value="limited">Limited</option>
                    <option value="unconfirmed">Unconfirmed</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center space-x-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newVendorAccessibility}
                  onChange={(e) => setNewVendorAccessibility(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span className="font-semibold text-slate-700">Supports Wheelchair / Physical Accessibility</span>
              </label>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Key Pros (Comma separated)</label>
                <input
                  type="text"
                  value={newVendorPros}
                  onChange={(e) => setNewVendorPros(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Key Cons / Caveats</label>
                <input
                  type="text"
                  value={newVendorCons}
                  onChange={(e) => setNewVendorCons(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddQuoteModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  Evaluate Quote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
