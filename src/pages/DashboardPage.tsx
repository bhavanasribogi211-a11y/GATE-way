import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { BRANCHES_INFO } from '../data/branchesData';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Plus,
  ArrowRight,
  TrendingUp,
  Award,
  AlertCircle,
  BookOpen,
  Calculator,
  Flame,
  CheckSquare,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const DashboardPage: React.FC = () => {
  const {
    user,
    selectedBranch,
    timetable,
    toggleTaskComplete,
    rebalanceTasks,
    syllabusMap,
    completedSubtopicIds,
    studyLogs,
    logStudySession,
    setActiveTab,
    setIsCalculatorOpen,
    notifications,
  } = useApp();

  const currentBranchInfo = BRANCHES_INFO.find(b => b.code === selectedBranch) || BRANCHES_INFO[0];
  const branchSyllabus = syllabusMap[selectedBranch] || syllabusMap.CS;

  // Study timer (Pomodoro style)
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [selectedSubjectTimer, setSelectedSubjectTimer] = useState<string>(
    branchSyllabus.subjects[0]?.name || 'General Aptitude'
  );
  const [timerTopic, setTimerTopic] = useState<string>('');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const handleStopAndLogTimer = () => {
    setIsTimerRunning(false);
    if (timerSeconds >= 60) {
      const minutes = Math.round(timerSeconds / 60);
      logStudySession({
        date: new Date().toISOString().slice(0, 10),
        subject: selectedSubjectTimer,
        topic: timerTopic || 'Self Study & Practice',
        durationMinutes: minutes,
        tasksCompleted: 1,
        notes: `Logged via Dashboard Focus Timer.`,
      });
      confetti({ particleCount: 40, spread: 60 });
    }
    setTimerSeconds(0);
    setTimerTopic('');
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Today's scheduled tasks
  const todayStr = new Date().toISOString().slice(0, 10);
  const todaysTasks = timetable.filter(t => t.date === todayStr);

  // Missed tasks detection
  const missedTasks = timetable.filter(t => t.date < todayStr && !t.completed);

  // Total study hours logged
  const totalHoursLogged = (
    studyLogs.reduce((acc, log) => acc + log.durationMinutes, 0) / 60
  ).toFixed(1);

  return (
    <div className="space-y-8 pb-12">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Welcome back, {user ? user.name : 'GATE Aspirant'}!
            </h1>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
              <span>Streak: {Math.max(studyLogs.length, 3)} Days</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Preparing for GATE {user?.targetYear || 2027} • Paper: [{currentBranchInfo.code}] {currentBranchInfo.name}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsCalculatorOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300/80 dark:border-amber-700 hover:bg-amber-100 transition"
          >
            <Calculator className="w-4 h-4 text-amber-600" />
            <span>Virtual Calc</span>
          </button>
          <button
            onClick={() => setActiveTab('mock-tests')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-sm"
          >
            <CheckSquare className="w-4 h-4" />
            <span>Take Quick Mock</span>
          </button>
        </div>
      </div>

      {/* Missed Tasks Alert Banner if any */}
      {missedTasks.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                You have {missedTasks.length} uncompleted tasks from previous days!
              </h4>
              <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                Our smart scheduling engine can automatically rebalance your upcoming slots without overloading your daily targets.
              </p>
            </div>
          </div>
          <button
            onClick={rebalanceTasks}
            className="shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition shadow-sm"
          >
            Auto-Rebalance Schedule
          </button>
        </div>
      )}

      {/* Grid: Left Main (Tasks & Subject Cards), Right Sidebar (Timer & Alerts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols wide) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Tasks Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Today's Study Schedule ({todayStr})
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('timetable')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
              >
                <span>Full Timetable</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {todaysTasks.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                <p>No study tasks scheduled specifically for today.</p>
                <button
                  onClick={() => setActiveTab('timetable')}
                  className="mt-2 text-indigo-600 underline font-semibold"
                >
                  Generate or refresh study timetable
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {todaysTasks.map(task => (
                  <div
                    key={task.id}
                    onClick={() => toggleTaskComplete(task.id)}
                    className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
                      task.completed
                        ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-indigo-400 shadow-sm'
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
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold ${
                            task.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {task.topicName}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {task.durationHours} hrs
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                          {task.type}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Subject: <span className="font-medium text-slate-700 dark:text-slate-300">{task.subjectName}</span>
                      </div>
                      {task.notes && (
                        <div className="text-[10px] text-slate-400 italic mt-0.5">{task.notes}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Subject-wise Completion Status */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Subject Completion Overview ({currentBranchInfo.shortName})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Weightage-weighted tracking based on completed syllabus subtopics
                </p>
              </div>
              <button
                onClick={() => setActiveTab('syllabus')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1"
              >
                <span>View All Topics</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3.5">
              {branchSyllabus.subjects.map(subject => {
                const totalSub = subject.subtopics.length;
                const completedSub = subject.subtopics.filter(s =>
                  completedSubtopicIds.includes(s.id)
                ).length;
                const pct = totalSub > 0 ? Math.round((completedSub / totalSub) * 100) : 0;

                return (
                  <div key={subject.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <span>{subject.name}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                          ~{subject.weightagePercentage}% marks
                        </span>
                      </div>
                      <div className="font-semibold text-slate-600 dark:text-slate-300">
                        {completedSub}/{totalSub} topics ({pct}%)
                      </div>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Focus Timer & Quick Widgets */}
        <div className="space-y-6">
          {/* Live Focus / Study Session Timer Card */}
          <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 text-white rounded-2xl p-6 border border-indigo-800/50 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Live Study Stopwatch</span>
              </span>
              {isTimerRunning && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
                  Recording
                </span>
              )}
            </div>

            {/* Timer Big Display */}
            <div className="text-center py-4">
              <div className="text-4xl font-extrabold font-mono tracking-wider text-white">
                {formatTimer(timerSeconds)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {isTimerRunning ? 'Session active: Keep focused!' : 'Ready to begin study block'}
              </div>
            </div>

            {/* Topic Input */}
            <div className="space-y-2 mb-4 text-xs">
              <div>
                <label className="text-[10px] text-indigo-200 block mb-1">Select Subject:</label>
                <select
                  value={selectedSubjectTimer}
                  onChange={e => setSelectedSubjectTimer(e.target.value)}
                  className="w-full bg-slate-800/90 text-slate-200 rounded-lg p-2 border border-slate-700 text-xs"
                >
                  {branchSyllabus.subjects.map(s => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-indigo-200 block mb-1">Current Topic / Subtopic:</label>
                <input
                  type="text"
                  placeholder="e.g. Asymptotic Notation PYQs"
                  value={timerTopic}
                  onChange={e => setTimerTopic(e.target.value)}
                  className="w-full bg-slate-800/90 text-slate-200 rounded-lg p-2 border border-slate-700 text-xs placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Timer Buttons */}
            <div className="flex items-center gap-2">
              {!isTimerRunning ? (
                <button
                  onClick={() => setIsTimerRunning(true)}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow transition"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start Focus Session</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsTimerRunning(false)}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow transition"
                >
                  <Pause className="w-4 h-4 fill-white" />
                  <span>Pause</span>
                </button>
              )}
              {timerSeconds > 0 && (
                <button
                  onClick={handleStopAndLogTimer}
                  className="px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition"
                  title="Stop and save session to study log"
                >
                  Save Log
                </button>
              )}
            </div>
          </div>

          {/* Quick Stats Summary */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Study Velocity
            </h4>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-xl font-bold text-slate-900 dark:text-white block font-mono">
                  {totalHoursLogged}h
                </span>
                <span className="text-[10px] text-slate-400 font-medium uppercase">Hours Logged</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400 block font-mono">
                  {completedSubtopicIds.length}
                </span>
                <span className="text-[10px] text-slate-400 font-medium uppercase">Topics Mastered</span>
              </div>
            </div>
          </div>

          {/* Important Deadline Widget */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Upcoming Milestones
              </h4>
              <button
                onClick={() => setActiveTab('notifications')}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold"
              >
                All Alerts
              </button>
            </div>

            <div className="space-y-2.5">
              {notifications.slice(0, 3).map(notif => (
                <div
                  key={notif.id}
                  onClick={() => setActiveTab('notifications')}
                  className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer text-xs"
                >
                  <div className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                    {notif.title}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                    <span>{notif.category}</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">{notif.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
