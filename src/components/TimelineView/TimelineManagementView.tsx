import React, { useState } from 'react';
import {
  AlertTriangle,
  Plus,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import {
  EventPlan,
  ScheduleItem,
  TaskItem,
} from '../../types/event';
import {
  detectScheduleConflicts,
  timeToMinutes,
  minutesToTime,
} from '../../utils/scheduleEngine';

interface TimelineManagementViewProps {
  plan: EventPlan;
  onUpdatePlan: (updatedPlan: EventPlan) => void;
}

export const TimelineManagementView: React.FC<TimelineManagementViewProps> = ({
  plan,
  onUpdatePlan,
}) => {
  const { schedule, scheduleConflicts, tasks, requirements } = plan;

  // Modals state
  const [showAddScheduleModal, setShowAddScheduleModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  // New Schedule Item Form State
  const [newTitle, setNewTitle] = useState('');
  const [newStartTime, setNewStartTime] = useState('19:00');
  const [newDuration, setNewDuration] = useState(45);
  const [newDesc, setNewDesc] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newLead, setNewLead] = useState('');

  // New Task Form State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<TaskItem['category']>('coordination');
  const [newTaskDeadline, setNewTaskDeadline] = useState(requirements.date);
  const [newTaskPriority, setNewTaskPriority] = useState<TaskItem['priority']>('medium');

  // Recalculate schedule conflicts on any schedule mutation
  const handleUpdateSchedule = (updatedSchedule: ScheduleItem[]) => {
    // Sort schedule chronologically
    const sorted = [...updatedSchedule].sort(
      (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
    );
    const newConflicts = detectScheduleConflicts(sorted, requirements.startTime, requirements.durationHours);

    onUpdatePlan({
      ...plan,
      schedule: sorted,
      scheduleConflicts: newConflicts,
    });
  };

  const handleAddScheduleItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const startMins = timeToMinutes(newStartTime);
    const endMins = startMins + newDuration;

    const newItem: ScheduleItem = {
      id: `sched-${Date.now()}`,
      title: newTitle.trim(),
      startTime: newStartTime,
      endTime: minutesToTime(endMins),
      durationMinutes: newDuration,
      description: newDesc.trim() || 'Scheduled activity item',
      location: newLocation.trim() || undefined,
      responsibleParty: newLead.trim() || undefined,
    };

    handleUpdateSchedule([...schedule, newItem]);
    setNewTitle('');
    setNewDesc('');
    setNewLocation('');
    setNewLead('');
    setShowAddScheduleModal(false);
  };

  const handleDeleteScheduleItem = (id: string) => {
    handleUpdateSchedule(schedule.filter((s) => s.id !== id));
  };

  const handleToggleTask = (taskId: string) => {
    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
    );
    onUpdatePlan({
      ...plan,
      tasks: updatedTasks,
    });
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      category: newTaskCategory,
      deadlineDate: newTaskDeadline,
      isCompleted: false,
      priority: newTaskPriority,
    };

    onUpdatePlan({
      ...plan,
      tasks: [...tasks, newTask],
    });
    setNewTaskTitle('');
    setShowAddTaskModal(false);
  };

  const handleDeleteTask = (taskId: string) => {
    onUpdatePlan({
      ...plan,
      tasks: tasks.filter((t) => t.id !== taskId),
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Schedule Conflicts Banner */}
      {scheduleConflicts.length > 0 ? (
        <div className="p-5 rounded-2xl bg-orange-50 border border-orange-200 text-orange-950 space-y-3">
          <div className="flex items-center space-x-2.5">
            <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0" />
            <h3 className="font-bold text-sm">
              {scheduleConflicts.length} Schedule & Constraint Conflict(s) Detected
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {scheduleConflicts.map((c) => (
              <div
                key={c.id}
                className="p-3.5 bg-white rounded-xl border border-orange-200 shadow-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-orange-700 bg-orange-100 px-2 py-0.5 rounded">
                    {c.type.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-semibold text-rose-600">Severity: {c.severity}</span>
                </div>
                <p className="text-slate-800 font-medium">{c.description}</p>
                <p className="text-slate-600 text-[11px]">
                  <strong>Recommended Resolution:</strong> {c.recommendedFix}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Timeline is conflict-free: setup buffers and activity sequences verified.</span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700">Verified by Constraint Engine</span>
        </div>
      )}

      {/* Main Grid: Schedule on Left, Preparation Tasks on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Run of Show Timeline */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-subtle p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-navy-900">Run of Show (Agenda Timeline)</h2>
              <p className="text-xs text-slate-500">
                Doors open at {requirements.startTime} • Duration: {requirements.durationHours} hours
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddScheduleModal(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Agenda Item</span>
            </button>
          </div>

          <div className="space-y-3 relative before:absolute before:inset-0 before:left-7 before:w-0.5 before:bg-slate-200 before:pointer-events-none">
            {schedule.map((item) => {
              const isSetup = item.isSetupCleanup;
              return (
                <div
                  key={item.id}
                  className={`relative flex items-start space-x-4 p-3.5 rounded-xl border transition-all ${
                    isSetup
                      ? 'bg-slate-50/70 border-dashed border-slate-300'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  {/* Time Badge Anchor */}
                  <div className="w-14 shrink-0 text-center relative z-10 bg-white py-1 rounded-lg border border-slate-200 shadow-xs">
                    <span className="text-[11px] font-extrabold text-navy-900 block leading-tight">
                      {item.startTime}
                    </span>
                    <span className="text-[9px] text-slate-400 block font-medium">
                      {item.durationMinutes}m
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-slate-900 text-xs sm:text-sm">{item.title}</h3>
                        {isSetup && (
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200">
                            Setup / Teardown
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteScheduleItem(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Delete schedule item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-slate-600 text-[11px] leading-relaxed">{item.description}</p>

                    <div className="flex flex-wrap gap-2 pt-1 text-[10px] text-slate-500">
                      {item.location && <span>📍 {item.location}</span>}
                      {item.responsibleParty && <span>👤 Lead: {item.responsibleParty}</span>}
                      {item.dependencies && item.dependencies.length > 0 && (
                        <span className="text-indigo-600 font-medium">
                          🔗 Depends on: {item.dependencies.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (5 cols): Preparation Tasks Manager */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-subtle p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-navy-900">Preparation Milestones</h2>
              <p className="text-xs text-slate-500">
                {tasks.filter((t) => t.isCompleted).length} / {tasks.length} Completed
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddTaskModal(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`p-3 rounded-xl border transition flex items-start justify-between gap-2 text-xs ${
                  task.isCompleted
                    ? 'bg-emerald-50/50 border-emerald-100 text-slate-500 line-through'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800 shadow-xs'
                }`}
              >
                <label className="flex items-start space-x-2.5 cursor-pointer flex-1">
                  <input
                    type="checkbox"
                    checked={task.isCompleted}
                    onChange={() => handleToggleTask(task.id)}
                    className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                  />
                  <div>
                    <span className="font-semibold block leading-snug">{task.title}</span>
                    <div className="flex items-center space-x-2 mt-1 text-[10px] text-slate-400 no-underline">
                      <span>Due: {task.deadlineDate}</span>
                      <span>•</span>
                      <span className="capitalize">{task.category}</span>
                    </div>
                  </div>
                </label>

                <div className="flex items-center space-x-1 shrink-0">
                  <span
                    className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                      task.priority === 'high'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {task.priority}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Schedule Item Modal */}
      {showAddScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-elevated border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-navy-900 text-sm">Add Timeline Activity</h3>
              <button
                type="button"
                onClick={() => setShowAddScheduleModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddScheduleItem} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Activity Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. VIP Toast & Photo Session"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={newTaskCategory}
                  onChange={(e) => setNewTaskCategory(e.target.value as TaskItem['category'])}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                >
                  <option value="coordination">Coordination</option>
                  <option value="venue">Venue</option>
                  <option value="catering">Catering</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="decor">Decor</option>
                  <option value="logistics">Logistics</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    min={5}
                    step={5}
                    value={newDuration}
                    onChange={(e) => setNewDuration(Math.max(5, parseInt(e.target.value, 10) || 5))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Location / Zone</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g. Main Courtyard or Stage A"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Responsible Lead</label>
                <input
                  type="text"
                  value={newLead}
                  onChange={(e) => setNewLead(e.target.value)}
                  placeholder="e.g. Master of Ceremonies"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Logistical details or cue notes"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddScheduleModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  Add Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-elevated border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-navy-900 text-sm">Add Preparation Milestone</h3>
              <button
                type="button"
                onClick={() => setShowAddTaskModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Task Description</label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Confirm final vegan menu headcount with caterer"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={newTaskCategory}
                  onChange={(e) => setNewTaskCategory(e.target.value as TaskItem['category'])}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                >
                  <option value="coordination">Coordination</option>
                  <option value="venue">Venue</option>
                  <option value="catering">Catering</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="decor">Decor</option>
                  <option value="logistics">Logistics</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Deadline Date</label>
                  <input
                    type="date"
                    value={newTaskDeadline}
                    onChange={(e) => setNewTaskDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as TaskItem['priority'])}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  Add Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
