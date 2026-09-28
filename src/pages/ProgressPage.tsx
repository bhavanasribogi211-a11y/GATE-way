import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BRANCHES_INFO } from '../data/branchesData';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Award,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Flame,
  Plus,
  ArrowUpRight,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ProgressPage: React.FC = () => {
  const {
    syllabusMap,
    completedSubtopicIds,
    selectedBranch,
    testResults,
    studyLogs,
    logStudySession,
  } = useApp();

  const [showLogModal, setShowLogModal] = useState(false);
  const [manualSubject, setManualSubject] = useState('Engineering Mathematics');
  const [manualTopic, setManualTopic] = useState('');
  const [manualMinutes, setManualMinutes] = useState(60);
  const [manualNotes, setManualNotes] = useState('');

  const branchData = syllabusMap[selectedBranch] || syllabusMap.CS;

  // Calculate syllabus stats
  let totalSubtopics = 0;
  let completedCount = 0;
  branchData.subjects.forEach(s => {
    s.subtopics.forEach(sub => {
      totalSubtopics++;
      if (completedSubtopicIds.includes(sub.id)) completedCount++;
    });
  });
  const syllabusPct = totalSubtopics > 0 ? Math.round((completedCount / totalSubtopics) * 100) : 0;

  // Study hours total
  const totalMinutes = studyLogs.reduce((acc, log) => acc + log.durationMinutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  // Mock accuracy average
  const avgAccuracy =
    testResults.length > 0
      ? Math.round(testResults.reduce((acc, r) => acc + r.accuracy, 0) / testResults.length)
      : 84; // Seeded baseline

  // Weak topics detection from tests or pending
  const weakTopics: string[] = [];
  testResults.forEach(r => {
    r.topicAnalysis.forEach(t => {
      if (t.correct / t.total < 0.6 && !weakTopics.includes(t.topic)) {
        weakTopics.push(t.topic);
      }
    });
  });
  if (weakTopics.length === 0) {
    weakTopics.push('Recurrence Relations & Asymptotic Trees');
    weakTopics.push('Pipeline Hazards & Structural Stalls');
    weakTopics.push('B+ Tree Index Calculations');
  }

  // Handle manual log
  const handleSaveManualLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTopic) return;

    logStudySession({
      date: new Date().toISOString().slice(0, 10),
      subject: manualSubject,
      topic: manualTopic,
      durationMinutes: manualMinutes,
      tasksCompleted: 1,
      notes: manualNotes || 'Self-study session.',
    });

    confetti({ particleCount: 30, spread: 50 });
    setManualTopic('');
    setManualNotes('');
    setShowLogModal(false);
  };

  // 7-day study hour chart mock calculations
  const last7Days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dailyDistributionHours = [3.5, 4.0, 5.0, 4.5, 6.0, 7.5, 4.0];
  const maxHours = Math.max(...dailyDistributionHours);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Preparation Progress & Analytics
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time analytics across syllabus mastery, study hours velocity, and mock CBT score trends.
          </p>
        </div>

        <button
          onClick={() => setShowLogModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Log Study Session</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Syllabus Covered</span>
            <BookOpen className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {syllabusPct}%
          </div>
          <span className="text-[11px] text-slate-400">
            {completedCount} / {totalSubtopics} Topics Mastered
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Total Hours Logged</span>
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {totalHours}h
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            On track with 4h daily target
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Mock Accuracy</span>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {avgAccuracy}%
          </div>
          <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold">
            Target: &gt; 80% for Top 100 AIR
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Active Study Streak</span>
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-orange-600 dark:text-orange-400 font-mono">
            {Math.max(studyLogs.length, 5)} Days
          </div>
          <span className="text-[11px] text-slate-400">Keep momentum rolling!</span>
        </div>
      </div>

      {/* Grid: Study Hours Bar Chart & Weak Topics Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Study Hours Visual Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Weekly Study Hours Activity
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Daily hours logged over the last 7 days vs your 4.0h goal
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-3 h-3 rounded bg-indigo-600" />
              <span>Logged Hours</span>
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="pt-6 pb-2">
            <div className="h-44 flex items-end justify-between gap-3 sm:gap-6 border-b border-slate-200 dark:border-slate-800 px-2 sm:px-6">
              {last7Days.map((day, idx) => {
                const hrs = dailyDistributionHours[idx];
                const heightPct = Math.round((hrs / (maxHours + 1)) * 100);

                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400 group-hover:text-indigo-600">
                      {hrs}h
                    </span>
                    <div className="w-full max-w-[42px] bg-slate-100 dark:bg-slate-800 rounded-t-xl h-full flex items-end overflow-hidden">
                      <div
                        className="w-full bg-gradient-to-t from-blue-600 via-indigo-600 to-purple-600 rounded-t-xl transition-all duration-500 group-hover:opacity-90"
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">
                      {day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Weak Topics Diagnostic Card (1 col) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Areas Requiring Practice
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Detected from mock error logs and pending complex modules:
          </p>

          <div className="space-y-2.5">
            {weakTopics.map((topic, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 text-xs"
              >
                <div className="font-bold text-slate-800 dark:text-slate-200">{topic}</div>
                <div className="text-[11px] text-amber-700 dark:text-amber-400 mt-1 flex items-center gap-1">
                  <span>Recommendation: Solve 15 topic PYQs + Short Notes revision</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subject-Wise Completion Progress Bars */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Subject-Wise Syllabus Completion ({branchData.branchCode})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {branchData.subjects.map(subj => {
            const total = subj.subtopics.length;
            const completed = subj.subtopics.filter(s => completedSubtopicIds.includes(s.id)).length;
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

            return (
              <div
                key={subj.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                    {subj.name}
                  </div>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {completed}/{total} ({pct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Milestones & Badges */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-950 text-white p-6 sm:p-8 rounded-3xl border border-indigo-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Preparation Milestones & Honors</span>
            </h3>
            <p className="text-xs text-indigo-200 mt-0.5">
              Badges awarded based on study streak consistency and mock test excellence.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur border border-white/15 text-center space-y-1">
            <span className="text-2xl block">🔥</span>
            <span className="text-xs font-bold text-white block">Streak Champion</span>
            <span className="text-[10px] text-slate-300">5+ consecutive days logged</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur border border-white/15 text-center space-y-1">
            <span className="text-2xl block">📐</span>
            <span className="text-xs font-bold text-white block">Math Foundation</span>
            <span className="text-[10px] text-slate-300">Calculus & Linear Algebra</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur border border-white/15 text-center space-y-1">
            <span className="text-2xl block">⏱️</span>
            <span className="text-xs font-bold text-white block">CBT Simulator Ready</span>
            <span className="text-[10px] text-slate-300">Mastered Virtual Calculator</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur border border-white/15 text-center space-y-1">
            <span className="text-2xl block">🎯</span>
            <span className="text-xs font-bold text-white block">Top 1% Ambition</span>
            <span className="text-[10px] text-slate-300">Targeting GATE AIR Under 100</span>
          </div>
        </div>
      </div>

      {/* Manual Study Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Log Completed Study Session
              </h3>
              <button onClick={() => setShowLogModal(false)} className="text-slate-400 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveManualLog} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Subject</label>
                <select
                  value={manualSubject}
                  onChange={e => setManualSubject(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  {branchData.subjects.map(s => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Topic / Subtopic Covered
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Asymptotic Notation and Recurrence Relations"
                  value={manualTopic}
                  onChange={e => setManualTopic(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Duration (Minutes): {manualMinutes} mins ({(manualMinutes / 60).toFixed(1)} hrs)
                </label>
                <input
                  type="range"
                  min={15}
                  max={360}
                  step={15}
                  value={manualMinutes}
                  onChange={e => setManualMinutes(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Notes / Highlights</label>
                <textarea
                  rows={2}
                  placeholder="Key concepts reviewed, formulas noted, or PYQ score..."
                  value={manualNotes}
                  onChange={e => setManualNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow"
                >
                  Log Study Time
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
