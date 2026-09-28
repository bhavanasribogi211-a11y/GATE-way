import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { BRANCHES_INFO } from '../data/branchesData';
import {
  Calendar,
  Clock,
  BookOpen,
  CheckSquare,
  Bell,
  BarChart3,
  Award,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  RotateCw,
  Target,
  FileText,
  Compass,
} from 'lucide-react';

const MOTIVATIONAL_TIPS = [
  {
    tip: 'Consistency beats intensity: Studying 4 focused hours every day beats cramming 14 hours on weekends.',
    author: 'GATE AIR 1 Advice',
  },
  {
    tip: 'Never skip General Aptitude and Engineering Math: They together constitute 28 marks with predictable question patterns.',
    author: 'Top Faculty Recommendation',
  },
  {
    tip: 'Master the on-screen Virtual Calculator early! Practice with our built-in simulator to avoid speed bottlenecks on exam day.',
    author: 'IIT Topper Strategy',
  },
  {
    tip: 'Maintain a dedicated "Mistake Diary". Review every question you got wrong in sectional mocks before starting new topics.',
    author: 'Preparation Mantra',
  },
  {
    tip: 'Solve past 15 years GATE questions at least twice: First to absorb patterns, second to achieve sub-2-minute accuracy.',
    author: 'Topper Insight',
  },
];

export const HomePage: React.FC = () => {
  const {
    setActiveTab,
    selectedBranch,
    setSelectedBranch,
    getSyllabusProgress,
    user,
    notifications,
    timetable,
  } = useApp();

  const [tipIndex, setTipIndex] = useState(0);

  // Exam Countdown calculation (e.g. Feb 6, 2027)
  const examDate = new Date('2027-02-06T09:30:00');
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date().getTime();
      const difference = examDate.getTime() - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const progress = getSyllabusProgress(selectedBranch);
  const currentBranch = BRANCHES_INFO.find(b => b.code === selectedBranch) || BRANCHES_INFO[0];

  // Today's pending tasks count
  const todayStr = new Date().toISOString().slice(0, 10);
  const todaysTasks = timetable.filter(t => t.date === todayStr);
  const todaysCompleted = todaysTasks.filter(t => t.completed).length;

  const rotateTip = () => {
    setTipIndex(prev => (prev + 1) % MOTIVATIONAL_TIPS.length);
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-950 text-white p-6 sm:p-10 lg:p-12 shadow-2xl border border-indigo-800/40">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-xs font-semibold text-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Target GATE 2027 / 2028 • Standardized Curriculum</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white">
            Plan Rigorously. Practice Relentlessly.{' '}
            <span className="bg-gradient-to-r from-blue-300 via-indigo-200 to-purple-200 bg-clip-text text-transparent">
              Crack GATE AIR 1.
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            Personalized study timetables synchronized with official branch weightage, interactive CBT mock tests with authentic Virtual Calculator, and real-time exam notifications.
          </p>

          {/* Live Countdown Clock */}
          <div className="pt-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-indigo-300 mb-2.5 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Countdown to GATE 2027 Examination</span>
            </div>
            <div className="grid grid-cols-4 max-w-md gap-2 sm:gap-3 text-center">
              <div className="bg-slate-900/80 backdrop-blur border border-indigo-500/30 rounded-xl p-2.5 sm:p-3">
                <span className="text-2xl sm:text-4xl font-extrabold font-mono text-white block">{timeLeft.days}</span>
                <span className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase">Days</span>
              </div>
              <div className="bg-slate-900/80 backdrop-blur border border-indigo-500/30 rounded-xl p-2.5 sm:p-3">
                <span className="text-2xl sm:text-4xl font-extrabold font-mono text-white block">{timeLeft.hours}</span>
                <span className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase">Hours</span>
              </div>
              <div className="bg-slate-900/80 backdrop-blur border border-indigo-500/30 rounded-xl p-2.5 sm:p-3">
                <span className="text-2xl sm:text-4xl font-extrabold font-mono text-white block">{timeLeft.minutes}</span>
                <span className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase">Minutes</span>
              </div>
              <div className="bg-slate-900/80 backdrop-blur border border-indigo-500/30 rounded-xl p-2.5 sm:p-3">
                <span className="text-2xl sm:text-4xl font-extrabold font-mono text-emerald-400 block">{timeLeft.seconds}</span>
                <span className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase">Seconds</span>
              </div>
            </div>
          </div>

          {/* Quick CTA Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-4">
            <button
              onClick={() => setActiveTab('timetable')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition transform active:scale-95"
            >
              <Calendar className="w-4 h-4" />
              <span>Generate Study Timetable</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('mock-tests')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition"
            >
              <CheckSquare className="w-4 h-4 text-emerald-400" />
              <span>Take CBT Mock Test</span>
            </button>
            <button
              onClick={() => setActiveTab('syllabus')}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-sm transition"
            >
              <BookOpen className="w-4 h-4" />
              <span>Explore Syllabus ({currentBranch.shortName})</span>
            </button>
          </div>
        </div>
      </section>

      {/* Snapshot Stats Bar */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Selected Paper & Target */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Selected GATE Paper</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              [{currentBranch.code}] {currentBranch.shortName}
            </div>
            <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">
              Target Year: {user?.targetYear || 2027}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Target className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Today's Tasks */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Today's Schedule</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              {todaysCompleted} / {todaysTasks.length || 3} Tasks Done
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
              Goal: {user?.dailyGoalHours || 4} hrs study target
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckSquare className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Syllabus Completed */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Syllabus Covered</div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{progress.percentage}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(progress.percentage, 5)}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            {progress.completed} of {progress.total} subtopics mastered
          </div>
        </div>

        {/* Card 4: Official Alerts */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Verified Updates</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              {notifications.length} Active Alerts
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-400 mt-0.5">
              Next: Admit Card (Jan 2027)
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <Bell className="w-6 h-6" />
          </div>
        </div>
      </section>

      {/* Motivational Tip & Topper Advice Card */}
      <section className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-200/80 dark:border-indigo-900/60 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-indigo-600 text-white mt-0.5">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Topper Insight & Daily Preparation Tip
              </span>
              <span className="text-[10px] bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-0.5 rounded-full font-medium">
                {MOTIVATIONAL_TIPS[tipIndex].author}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-1 italic">
              "{MOTIVATIONAL_TIPS[tipIndex].tip}"
            </p>
          </div>
        </div>
        <button
          onClick={rotateTip}
          className="self-end sm:self-center flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Next Tip</span>
        </button>
      </section>

      {/* Quick Access Feature Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Core Preparation Modules</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Everything required to structure, practice, and evaluate your GATE readiness
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Module 1: Study Planner */}
          <div
            onClick={() => setActiveTab('timetable')}
            className="group cursor-pointer p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-xl transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition flex items-center justify-between">
              <span>Personalized Study Timetable</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition transform group-hover:translate-x-1" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Auto-generate day-by-day and weekly schedules based on syllabus weightage, study hours, and exam date. Auto-rebalance missed study sessions.
            </p>
            <div className="mt-4 flex items-center gap-2 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
              <span>Generate Custom Schedule →</span>
            </div>
          </div>

          {/* Module 2: Complete Syllabus */}
          <div
            onClick={() => setActiveTab('syllabus')}
            className="group cursor-pointer p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-xl transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition flex items-center justify-between">
              <span>Complete Official Syllabus</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition transform group-hover:translate-x-1" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Paper-wise subtopic tracking for CSE, ECE, ME, Civil, EE, DA, etc. Includes important formulas, concise notes, and previous-year question mapping.
            </p>
            <div className="mt-4 flex items-center gap-2 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
              <span>Track Topic Checkboxes →</span>
            </div>
          </div>

          {/* Module 3: Mock Tests & CBT Simulator */}
          <div
            onClick={() => setActiveTab('mock-tests')}
            className="group cursor-pointer p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-xl transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <CheckSquare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition flex items-center justify-between">
              <span>CBT Mock Tests & PYQ Bank</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition transform group-hover:translate-x-1" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Experience the authentic GATE examination screen with question palette, negative marking, timer, and the official Scientific Virtual Calculator.
            </p>
            <div className="mt-4 flex items-center gap-2 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span>Start Timed Test →</span>
            </div>
          </div>

          {/* Module 4: Verified Notifications */}
          <div
            onClick={() => setActiveTab('notifications')}
            className="group cursor-pointer p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-xl transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition flex items-center justify-between">
              <span>Exam Notifications & Deadlines</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition transform group-hover:translate-x-1" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Stay ahead with verified registration dates, correction windows, admit card releases, answer key challenges, and COAP/CCMT counselling timelines.
            </p>
            <div className="mt-4 flex items-center gap-2 text-[11px] font-semibold text-purple-600 dark:text-purple-400">
              <span>View Official Deadlines →</span>
            </div>
          </div>

          {/* Module 5: Progress Analytics */}
          <div
            onClick={() => setActiveTab('progress')}
            className="group cursor-pointer p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 hover:shadow-xl transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition flex items-center justify-between">
              <span>Progress Tracking & Analytics</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition transform group-hover:translate-x-1" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Log daily study hours, monitor topic completion heatmaps, diagnose weak subjects, and evaluate accuracy percentiles across all mock attempts.
            </p>
            <div className="mt-4 flex items-center gap-2 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
              <span>Inspect Performance Charts →</span>
            </div>
          </div>

          {/* Module 6: Formula Sheets & Resources */}
          <div
            onClick={() => setActiveTab('resources')}
            className="group cursor-pointer p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-500 dark:hover:border-cyan-500 hover:shadow-xl transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition flex items-center justify-between">
              <span>Handcrafted Formula Books</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition transform group-hover:translate-x-1" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Curated formula cheat sheets for Engineering Mathematics and Core branch subjects, standard reference textbook lists, and calculator operational guides.
            </p>
            <div className="mt-4 flex items-center gap-2 text-[11px] font-semibold text-cyan-600 dark:text-cyan-400">
              <span>Access Formula Booklets →</span>
            </div>
          </div>
        </div>
      </section>

      {/* Engineering Branches Grid */}
      <section className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8">
        <div className="max-w-2xl mb-6">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4" />
            <span>Supported GATE Papers</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Choose Your Engineering Branch
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Click on any branch to switch your active syllabus, question bank, and study plan instantly.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {BRANCHES_INFO.map(branch => {
            const isSelected = selectedBranch === branch.code;
            return (
              <button
                key={branch.code}
                onClick={() => setSelectedBranch(branch.code)}
                className={`p-4 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'bg-white dark:bg-slate-800 border-indigo-600 shadow-md ring-2 ring-indigo-500/20'
                    : 'bg-white/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                    {branch.code}
                  </span>
                  {isSelected && (
                    <span className="text-[10px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </div>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                  {branch.shortName}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                  {branch.description}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Official GATE Pattern Overview Card */}
      <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Official GATE Examination Pattern Snapshot
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 dark:text-slate-400 block font-medium">Exam Duration</span>
            <span className="text-base font-bold text-slate-900 dark:text-white mt-0.5 block">180 Minutes (3 Hours)</span>
            <span className="text-[11px] text-slate-500">Computer Based Test (CBT)</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 dark:text-slate-400 block font-medium">Total Questions & Marks</span>
            <span className="text-base font-bold text-slate-900 dark:text-white mt-0.5 block">65 Questions • 100 Marks</span>
            <span className="text-[11px] text-slate-500">1-mark & 2-mark questions</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 dark:text-slate-400 block font-medium">Sections Breakdown</span>
            <span className="text-base font-bold text-slate-900 dark:text-white mt-0.5 block">GA (15) + Math (13) + Core (72)</span>
            <span className="text-[11px] text-slate-500">Except DA/some non-math papers</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 dark:text-slate-400 block font-medium">Question Types</span>
            <span className="text-base font-bold text-slate-900 dark:text-white mt-0.5 block">MCQ, MSQ & NAT</span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400">No negative marks for MSQ & NAT</span>
          </div>
        </div>
      </section>
    </div>
  );
};
