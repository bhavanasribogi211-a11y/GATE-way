import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BRANCHES_INFO } from '../data/branchesData';
import { BranchCode, PrepLevel, StudyPlanConfig, TimetableTask } from '../types';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Circle,
  RotateCcw,
  Printer,
  Download,
  Filter,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  BookOpen,
  CheckSquare,
  AlertTriangle,
  Layers,
  Search,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const TimetablePage: React.FC = () => {
  const {
    timetable,
    timetableConfig,
    generateTimetable,
    toggleTaskComplete,
    rebalanceTasks,
    selectedBranch,
    setSelectedBranch,
    syllabusMap,
  } = useApp();

  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly' | 'printable'>('weekly');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isConfigDrawerOpen, setIsConfigDrawerOpen] = useState(false);

  // Local config form state
  const [targetYear, setTargetYear] = useState(timetableConfig.targetYear || 2027);
  const [formBranch, setFormBranch] = useState<BranchCode>(selectedBranch);
  const [examDate, setExamDate] = useState(timetableConfig.examDate || '2027-02-06');
  const [dailyHours, setDailyHours] = useState(timetableConfig.dailyHours || 4);
  const [weekendHours, setWeekendHours] = useState(timetableConfig.weekendHours || 6);
  const [prepLevel, setPrepLevel] = useState<PrepLevel>(timetableConfig.prepLevel || 'Intermediate');
  const [focusWeakAreas, setFocusWeakAreas] = useState(timetableConfig.focusWeakAreas ?? true);

  // Selected date for daily view or current view offset
  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedBranch(formBranch);
    generateTimetable({
      targetYear,
      branchCode: formBranch,
      examDate,
      dailyHours,
      weekendHours,
      prepLevel,
      focusWeakAreas,
      includeBufferDays: true,
    });
    setIsConfigDrawerOpen(false);
  };

  const handlePrint = () => {
    window.print();
  };

  // Group tasks by date
  const tasksByDate = timetable.reduce<Record<string, TimetableTask[]>>((acc, task) => {
    if (!acc[task.date]) acc[task.date] = [];
    acc[task.date].push(task);
    return acc;
  }, {});

  const datesList = Object.keys(tasksByDate).sort();

  // Filter tasks based on search & type
  const filterTask = (task: TimetableTask) => {
    if (filterType !== 'ALL' && task.type !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        task.topicName.toLowerCase().includes(q) ||
        task.subjectName.toLowerCase().includes(q) ||
        (task.notes && task.notes.toLowerCase().includes(q))
      );
    }
    return true;
  };

  // Missed tasks
  const missedTasks = timetable.filter(t => t.date < todayStr && !t.completed);
  const completedCount = timetable.filter(t => t.completed).length;
  const totalTasks = timetable.length;
  const progressPct = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Selected week slice
  const currentWeekDates = datesList.slice(0, 7);

  return (
    <div className="space-y-6 pb-12">
      {/* Printable Sheet View when printing or switched to printable */}
      <div className={viewMode === 'printable' ? 'block' : 'hidden print:block'}>
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 text-black space-y-6">
          <div className="flex justify-between items-start border-b pb-4">
            <div>
              <h1 className="text-2xl font-bold">GATE Prep Planner — Personalized Study Schedule</h1>
              <p className="text-xs text-slate-600 mt-1">
                Paper: [{selectedBranch}] {BRANCHES_INFO.find(b => b.code === selectedBranch)?.name} • Target: GATE {targetYear}
              </p>
              <p className="text-xs text-slate-500">
                Study Velocity: {dailyHours}h weekdays / {weekendHours}h weekends • Diagnostic Level: {prepLevel}
              </p>
            </div>
            <div className="text-right no-print">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 shadow"
              >
                Print / Save as PDF
              </button>
            </div>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300 bg-slate-100">
                <th className="p-2 font-bold">Date & Day</th>
                <th className="p-2 font-bold">Subject</th>
                <th className="p-2 font-bold">Topic / Module</th>
                <th className="p-2 font-bold">Type</th>
                <th className="p-2 font-bold">Hrs</th>
                <th className="p-2 font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {timetable.slice(0, 45).map(task => (
                <tr key={task.id} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="p-2 font-medium">{task.date} ({task.dayOfWeek.slice(0, 3)})</td>
                  <td className="p-2">{task.subjectName}</td>
                  <td className="p-2 font-semibold">{task.topicName}</td>
                  <td className="p-2 text-slate-600">{task.type}</td>
                  <td className="p-2">{task.durationHours}h</td>
                  <td className="p-2">{task.completed ? '✓ Completed' : 'Pending'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[10px] text-slate-500 italic">
            * Generated by GATE Prep Planner algorithm based on official GATE weightage and revision loops.
          </p>
        </div>
      </div>

      {/* Main Interactive Timetable Header */}
      <div className="no-print space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Smart Study Timetable
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Customized for [{selectedBranch}] • {dailyHours}h Daily • {prepLevel} Level • Overall Progress: {progressPct}%
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {missedTasks.length > 0 && (
              <button
                onClick={rebalanceTasks}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition shadow-sm animate-bounce"
                title="Automatically reschedule overdue sessions to upcoming free slots"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Rebalance ({missedTasks.length} Missed)</span>
              </button>
            )}

            <button
              onClick={() => setIsConfigDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-sm"
            >
              <Sliders className="w-4 h-4" />
              <span>Customize Timetable</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition"
              title="Print or Export as PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>

        {/* View Switcher & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-xs font-semibold">
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-3 py-1.5 rounded-lg transition ${
                viewMode === 'weekly'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Weekly Schedule
            </button>
            <button
              onClick={() => setViewMode('daily')}
              className={`px-3 py-1.5 rounded-lg transition ${
                viewMode === 'daily'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Daily View
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1.5 rounded-lg transition ${
                viewMode === 'monthly'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Month Roadmap
            </button>
            <button
              onClick={() => setViewMode('printable')}
              className={`px-3 py-1.5 rounded-lg transition ${
                viewMode === 'printable'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Printable PDF
            </button>
          </div>

          {/* Search & Filter Dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search topic / subject..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-44 sm:w-56"
              />
            </div>

            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium"
            >
              <option value="ALL">All Task Types</option>
              <option value="Theory & Concept">Theory & Concept</option>
              <option value="Practice PYQ">Practice PYQ</option>
              <option value="Revision & Notes">Revision & Notes</option>
              <option value="Mock Test">Mock Test</option>
            </select>
          </div>
        </div>

        {/* View Mode: WEEKLY VIEW */}
        {viewMode === 'weekly' && (
          <div className="space-y-6">
            {datesList.slice(0, 14).map(dateKey => {
              const dayTasks = (tasksByDate[dateKey] || []).filter(filterTask);
              if (dayTasks.length === 0 && filterType !== 'ALL') return null;

              const isToday = dateKey === todayStr;
              const isPast = dateKey < todayStr;
              const dayName = dayTasks[0]?.dayOfWeek || new Date(dateKey).toLocaleDateString('en-US', { weekday: 'long' });

              return (
                <div
                  key={dateKey}
                  className={`rounded-2xl border transition-all ${
                    isToday
                      ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-400 dark:border-indigo-600 ring-2 ring-indigo-500/20 shadow'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {dateKey} • {dayName}
                      </span>
                      {isToday && (
                        <span className="text-[10px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Today
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      {dayTasks.filter(t => t.completed).length} / {dayTasks.length} Completed
                    </div>
                  </div>

                  <div className="p-4 space-y-2.5">
                    {dayTasks.map(task => (
                      <div
                        key={task.id}
                        onClick={() => toggleTaskComplete(task.id)}
                        className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
                          task.completed
                            ? 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 text-slate-400'
                            : task.isMissed
                            ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
                            : 'bg-slate-50/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                        }`}
                      >
                        <button className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400">
                          {task.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-400 hover:text-indigo-600" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`text-xs font-bold ${
                                task.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'
                              }`}
                            >
                              {task.topicName}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                              {task.durationHours} hrs
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                                task.type === 'Mock Test'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : task.type === 'Revision & Notes'
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                  : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                              }`}
                            >
                              {task.type}
                            </span>
                            {task.isMissed && !task.completed && (
                              <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-amber-500 text-white">
                                Overdue
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                            Subject: <span className="font-semibold text-slate-700 dark:text-slate-300">{task.subjectName}</span>
                          </div>
                          {task.notes && (
                            <div className="text-[10px] text-slate-400 italic mt-0.5">{task.notes}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View Mode: DAILY VIEW */}
        {viewMode === 'daily' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const idx = datesList.indexOf(selectedDate);
                    if (idx > 0) setSelectedDate(datesList[idx - 1]);
                  }}
                  className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedDate} ({new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' })})
                </span>
                <button
                  onClick={() => {
                    const idx = datesList.indexOf(selectedDate);
                    if (idx < datesList.length - 1) setSelectedDate(datesList[idx + 1]);
                  }}
                  className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => setSelectedDate(todayStr)}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Jump to Today
              </button>
            </div>

            <div className="space-y-3">
              {(tasksByDate[selectedDate] || []).filter(filterTask).map(task => (
                <div
                  key={task.id}
                  onClick={() => toggleTaskComplete(task.id)}
                  className={`p-4 rounded-xl border flex items-start gap-4 cursor-pointer transition ${
                    task.completed
                      ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm'
                  }`}
                >
                  <button className="mt-1">
                    {task.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-100" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-400 hover:text-indigo-600" />
                    )}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${task.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                        {task.topicName}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                        {task.durationHours} hrs
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Subject: <span className="font-semibold text-slate-700 dark:text-slate-300">{task.subjectName}</span> • Type: {task.type}
                    </div>
                    {task.notes && (
                      <p className="text-xs text-slate-400 mt-1 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg">
                        {task.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View Mode: MONTHLY ROADMAP */}
        {viewMode === 'monthly' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Monthly Preparation Milestones & Topic Distribution
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Bird’s eye view of syllabus progression through your target GATE examination date.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-950/20">
                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider block mb-1">
                  Month 1: Foundation & Core Theory
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Focus on high-weightage math (Linear Algebra, Calculus) and core fundamentals (Data Structures, Networks, Thermal, SOM). Aim for 70% conceptual clarity.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/30 dark:bg-purple-950/20">
                <span className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider block mb-1">
                  Month 2: PYQ Mastery & Sectional Tests
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Solve past 15 years official GATE questions topic-by-topic. Start maintaining your "Mistake Diary" for tricky calculations and trap options.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block mb-1">
                  Month 3+: Full-Length Mocks & Revision
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Take full 3-hour CBT simulator mocks every weekend using the official Virtual Calculator. Intensive formula recall and speed optimization.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Customize Timetable Modal / Drawer */}
      {isConfigDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Personalize Your Study Schedule
                </h3>
              </div>
              <button
                onClick={() => setIsConfigDrawerOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4 text-xs">
              {/* Paper Selection */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Selected GATE Paper
                </label>
                <select
                  value={formBranch}
                  onChange={e => setFormBranch(e.target.value as BranchCode)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                >
                  {BRANCHES_INFO.map(b => (
                    <option key={b.code} value={b.code}>
                      [{b.code}] {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Year & Exam Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Target Exam Year
                  </label>
                  <select
                    value={targetYear}
                    onChange={e => setTargetYear(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value={2027}>GATE 2027 (Feb 2027)</option>
                    <option value={2028}>GATE 2028 (Feb 2028)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Tentative Exam Date
                  </label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={e => setExamDate(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Daily & Weekend Hours */}
              <div className="space-y-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <div>
                  <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Weekday Study Hours / Day:</span>
                    <span className="text-indigo-600 font-mono">{dailyHours} Hours</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={10}
                    step={1}
                    value={dailyHours}
                    onChange={e => setDailyHours(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>2 hrs (Working / College)</span>
                    <span>6 hrs (Dedicated)</span>
                    <span>10 hrs (Full-time)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Weekend Study Hours / Day:</span>
                    <span className="text-indigo-600 font-mono">{weekendHours} Hours</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={12}
                    step={1}
                    value={weekendHours}
                    onChange={e => setWeekendHours(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
              </div>

              {/* Current Preparation Level */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Current Preparation Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Beginner', 'Intermediate', 'Advanced'] as PrepLevel[]).map(lvl => (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => setPrepLevel(lvl)}
                      className={`p-2 rounded-xl text-center font-bold border transition ${
                        prepLevel === lvl
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {prepLevel === 'Beginner' && 'Allocates more time for foundational theory and concept building.'}
                  {prepLevel === 'Intermediate' && 'Balanced mix of theory, standard examples, and PYQs.'}
                  {prepLevel === 'Advanced' && 'Heavy emphasis on mock tests, speed analysis, and tricky PYQs.'}
                </p>
              </div>

              {/* Focus Weak Areas Checkbox */}
              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 cursor-pointer">
                <input
                  type="checkbox"
                  checked={focusWeakAreas}
                  onChange={e => setFocusWeakAreas(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Prioritize High-Weightage Core Subjects & Math First
                </span>
              </label>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsConfigDrawerOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md"
                >
                  Generate My Timetable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
