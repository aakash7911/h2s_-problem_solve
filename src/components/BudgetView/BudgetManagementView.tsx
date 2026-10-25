import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Plus,
  Trash2,
  Shield,
  AlertTriangle,
  TrendingDown,
} from 'lucide-react';
import {
  EventPlan,
  ExpenseItem,
  ExpenseCategory,
} from '../../types/event';
import {
  calculateBudgetBreakdown,
  calculateSavingsOpportunities,
  CATEGORY_LABELS,
} from '../../utils/budgetEngine';

interface BudgetManagementViewProps {
  plan: EventPlan;
  onUpdatePlan: (updatedPlan: EventPlan) => void;
}

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  venue: '#4F46E5', // indigo
  catering: '#06B6D4', // cyan
  decor: '#EC4899', // pink
  entertainment: '#8B5CF6', // purple
  photography: '#F59E0B', // amber
  equipment: '#10B981', // emerald
  contingency: '#64748B', // slate
  invitations: '#3B82F6', // blue
  miscellaneous: '#94A3B8', // slate-light
};

export const BudgetManagementView: React.FC<BudgetManagementViewProps> = ({
  plan,
  onUpdatePlan,
}) => {
  const { budget, requirements } = plan;

  // New Item State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemCategory, setNewItemCategory] = useState<ExpenseCategory>('decor');
  const [newItemName, setNewItemName] = useState('');
  const [newItemCost, setNewItemCost] = useState(150);
  const [newItemEssential, setNewItemEssential] = useState(false);
  const [newItemSavingsAlt, setNewItemSavingsAlt] = useState('');
  const [newItemPotentialSavings, setNewItemPotentialSavings] = useState(50);

  // Recalculate helper
  const handleUpdateItems = (updatedItems: ExpenseItem[], newContingencyPct?: number) => {
    const contingencyPct = newContingencyPct ?? budget.contingencyPercentage;
    const newBudget = calculateBudgetBreakdown(
      budget.totalBudget,
      budget.currency,
      updatedItems,
      contingencyPct,
      requirements.eventType
    );

    onUpdatePlan({
      ...plan,
      budget: newBudget,
    });
  };

  const handleToggleEssential = (itemId: string) => {
    const updated = budget.items.map((i) =>
      i.id === itemId ? { ...i, isEssential: !i.isEssential } : i
    );
    handleUpdateItems(updated);
  };

  const handleCostChange = (itemId: string, newCost: number) => {
    const safeCost = Math.max(0, isNaN(newCost) ? 0 : newCost);
    const updated = budget.items.map((i) =>
      i.id === itemId ? { ...i, estimatedCost: safeCost } : i
    );
    handleUpdateItems(updated);
  };

  const handleDeleteItem = (itemId: string) => {
    const updated = budget.items.filter((i) => i.id !== itemId);
    handleUpdateItems(updated);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: ExpenseItem = {
      id: `item-${Date.now()}`,
      category: newItemCategory,
      name: newItemName.trim(),
      estimatedCost: newItemCost,
      isEssential: newItemEssential,
      savingsAlternative: newItemSavingsAlt.trim() || undefined,
      potentialSavings: newItemPotentialSavings > 0 ? newItemPotentialSavings : undefined,
    };

    handleUpdateItems([...budget.items, newItem]);
    setNewItemName('');
    setNewItemCost(150);
    setNewItemEssential(false);
    setNewItemSavingsAlt('');
    setShowAddModal(false);
  };

  const handleContingencyChange = (pct: number) => {
    handleUpdateItems(budget.items, pct);
  };

  const savingsOps = calculateSavingsOpportunities(budget);

  // Chart Data Preparation
  const pieData = budget.categoryAllocations
    .filter((c) => c.allocatedBudget > 0 || c.currentEstimatedTotal > 0)
    .map((c) => ({
      name: c.description,
      category: c.category,
      value: c.currentEstimatedTotal,
      allocated: c.allocatedBudget,
      color: CATEGORY_COLORS[c.category] || '#94A3B8',
    }));

  const barData = budget.categoryAllocations
    .filter((c) => c.category !== 'contingency')
    .map((c) => ({
      name: c.description.split(' ')[0], // short name
      fullName: c.description,
      Allocated: c.allocatedBudget,
      Estimated: c.currentEstimatedTotal,
    }));

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Financial Health Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Budget Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle">
          <span className="text-xs font-semibold text-slate-500 block">Total Budget Cap</span>
          <div className="text-2xl font-black text-navy-900 mt-1">
            {budget.currency} {budget.totalBudget.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Allocated across {budget.categoryAllocations.length} categories
          </div>
        </div>

        {/* Committed Estimated Cost */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle">
          <span className="text-xs font-semibold text-slate-500 block">Estimated Expenses</span>
          <div className="text-2xl font-black text-indigo-700 mt-1">
            {budget.currency} {budget.totalEstimatedCost.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {Math.round((budget.totalEstimatedCost / budget.totalBudget) * 100)}% of total budget
          </div>
        </div>

        {/* Remaining Headroom */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle">
          <span className="text-xs font-semibold text-slate-500 block">Remaining Headroom</span>
          <div
            className={`text-2xl font-black mt-1 ${
              budget.isOverBudget
                ? 'text-rose-600'
                : budget.remainingBudget < 250
                ? 'text-amber-600'
                : 'text-emerald-600'
            }`}
          >
            {budget.currency} {budget.remainingBudget.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {budget.isOverBudget
              ? `Deficit of ${budget.currency} ${budget.overBudgetAmount.toLocaleString()}`
              : 'Available for surprise add-ons'}
          </div>
        </div>

        {/* Contingency Reserve */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-500">Contingency ({budget.contingencyPercentage}%)</span>
            <Shield className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-navy-900 mt-1">
            {budget.currency} {budget.contingencyReserve.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center space-x-1">
            <span>Locked rainy-day safety fund</span>
          </div>
        </div>
      </div>

      {/* Overbudget or Pressure Banner */}
      {budget.budgetPressureLevel !== 'healthy' && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
            budget.budgetPressureLevel === 'critical'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <p>{budget.budgetPressureReason}</p>
          </div>
          {savingsOps.totalPotentialSavings > 0 && (
            <span className="font-bold underline shrink-0 ml-2">
              Potential Savings: {budget.currency} {savingsOps.totalPotentialSavings.toLocaleString()}
            </span>
          )}
        </div>
      )}

      {/* Contingency Slider Control */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-0.5 max-w-lg">
          <div className="flex items-center space-x-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy-900">
              Contingency Reserve Slider
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
              {budget.contingencyPercentage}% of budget
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Dynamically adjust the percentage held strictly in reserve for day-of overtime, delivery taxes, or surge guests.
          </p>
        </div>

        <div className="w-full sm:w-64 space-y-1">
          <input
            type="range"
            min={5}
            max={25}
            step={1}
            value={budget.contingencyPercentage}
            onChange={(e) => handleContingencyChange(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-medium">
            <span>5% (Lean)</span>
            <span>15% (Recommended)</span>
            <span>25% (Ultra Safe)</span>
          </div>
        </div>
      </div>

      {/* Visualizations Row: Donut Chart & Category Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Allocation Donut Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-navy-900">
            Category Allocation Distribution
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${budget.currency} ${value.toLocaleString()}`, 'Committed']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 justify-center text-[11px] pt-1 border-t border-slate-100">
            {pieData.map((entry) => (
              <div key={entry.name} className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-slate-600">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Allocated vs Estimated Bar Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-navy-900">
            Target Allocation vs. Estimated Spend
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: number) => [`${budget.currency} ${val.toLocaleString()}`]}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Bar dataKey="Allocated" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Estimated" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Realistic Savings Opportunities Box */}
      {savingsOps.recommendations.length > 0 && (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-emerald-200 pb-2.5">
            <div className="flex items-center space-x-2">
              <TrendingDown className="w-5 h-5 text-emerald-700" />
              <div>
                <h3 className="text-sm font-bold text-emerald-950">
                  Realistic Savings Alternatives Detected
                </h3>
                <p className="text-xs text-emerald-800">
                  Cut non-essential expenses to recover up to{' '}
                  <strong className="underline">
                    {budget.currency} {savingsOps.totalPotentialSavings.toLocaleString()}
                  </strong>
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {savingsOps.recommendations.map((rec) => (
              <div
                key={rec.itemId}
                className="p-3.5 bg-white rounded-xl border border-emerald-200/80 shadow-xs space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{rec.itemName}</span>
                  <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Save ~{budget.currency} {rec.potentialSavings.toLocaleString()}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  <strong>Alternative:</strong> {rec.alternative}
                </p>
                <div className="text-[10px] text-slate-400">
                  {rec.isEssential ? 'Essential Expense (Caution)' : 'Optional Expense (Recommended Cut)'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Expense Items Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-navy-900">Line-Item Expenses</h3>
            <p className="text-xs text-slate-500">
              Edit amounts directly to immediately recalculate remaining budget and pressure indicators
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom Expense</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Item & Category</th>
                <th className="py-3 px-4">Priority Status</th>
                <th className="py-3 px-4">Estimated Cost</th>
                <th className="py-3 px-4">Savings Alternative</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {budget.items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">{item.name}</div>
                    <span className="text-[10px] text-slate-400 uppercase font-medium">
                      {CATEGORY_LABELS[item.category] || item.category}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => handleToggleEssential(item.id)}
                      className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                        item.isEssential
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                      }`}
                      title="Click to toggle essential vs optional"
                    >
                      <Shield className="w-2.5 h-2.5" />
                      <span>{item.isEssential ? 'ESSENTIAL (Protected)' : 'OPTIONAL (Upgrade)'}</span>
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1">
                      <span className="text-slate-400 font-medium">{budget.currency}</span>
                      <input
                        type="number"
                        min={0}
                        step={10}
                        value={item.estimatedCost}
                        onChange={(e) => handleCostChange(item.id, parseInt(e.target.value, 10))}
                        className="w-24 px-2 py-1 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-600 font-semibold"
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4 max-w-xs truncate text-[11px] text-slate-600">
                    {item.savingsAlternative ? (
                      <span title={item.savingsAlternative}>{item.savingsAlternative}</span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition"
                      title="Delete expense"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Custom Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-elevated border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-navy-900 text-sm">Add New Expense Item</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Item Description</label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g. Polaroid Guest Book Station"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-2 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([cat, label]) => (
                      <option key={cat} value={cat}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estimated Cost ({budget.currency})</label>
                  <input
                    type="number"
                    min={0}
                    value={newItemCost}
                    onChange={(e) => setNewItemCost(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    required
                  />
                </div>
              </div>

              <label className="flex items-center space-x-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newItemEssential}
                  onChange={(e) => setNewItemEssential(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span className="font-semibold text-slate-700">Mark as Essential (Protected against cuts)</span>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Savings Alternative (Optional)</label>
                  <input
                    type="text"
                    value={newItemSavingsAlt}
                    onChange={(e) => setNewItemSavingsAlt(e.target.value)}
                    placeholder="e.g. Bring own equipment"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Potential Savings ({budget.currency})</label>
                  <input
                    type="number"
                    min={0}
                    value={newItemPotentialSavings}
                    onChange={(e) => setNewItemPotentialSavings(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
