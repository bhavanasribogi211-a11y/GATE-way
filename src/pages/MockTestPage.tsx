import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MOCK_TESTS_CATALOG, PRACTICE_QUESTIONS } from '../data/mockTestsData';
import { MockTest, Question, TestResponse, TestResult } from '../types';
import {
  CheckSquare,
  Clock,
  Calculator,
  Bookmark,
  Award,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Filter,
  Eye,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const MockTestPage: React.FC = () => {
  const {
    selectedBranch,
    saveTestResult,
    bookmarkedQuestionIds,
    toggleBookmarkQuestion,
    setIsCalculatorOpen,
    user,
  } = useApp();

  // Active view: 'catalog' | 'cbt_exam' | 'result_view' | 'practice_bank'
  const [viewState, setViewState] = useState<'catalog' | 'cbt_exam' | 'result_view' | 'practice_bank'>('catalog');
  const [activeTest, setActiveTest] = useState<MockTest | null>(null);
  const [latestResult, setLatestResult] = useState<TestResult | null>(null);

  // CBT Exam State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [responses, setResponses] = useState<Record<string, TestResponse>>({});

  // Practice bank filters
  const [practiceSubjectFilter, setPracticeSubjectFilter] = useState('ALL');
  const [practiceTypeFilter, setPracticeTypeFilter] = useState('ALL');
  const [practiceDifficulty, setPracticeDifficulty] = useState('ALL');
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});

  // Start CBT Test
  const handleStartTest = (test: MockTest) => {
    setActiveTest(test);
    setSecondsRemaining(test.durationMinutes * 60);
    setCurrentQuestionIndex(0);

    // Initialize responses
    const initialResponses: Record<string, TestResponse> = {};
    test.questions.forEach((q, idx) => {
      initialResponses[q.id] = {
        questionId: q.id,
        status: idx === 0 ? 'not_answered' : 'not_visited',
        timeSpentSeconds: 0,
      };
    });
    setResponses(initialResponses);
    setViewState('cbt_exam');
  };

  // Timer countdown in CBT mode
  useEffect(() => {
    if (viewState !== 'cbt_exam' || secondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [viewState, secondsRemaining]);

  const currentQuestion = activeTest?.questions[currentQuestionIndex];
  const currentResponse = currentQuestion ? responses[currentQuestion.id] : undefined;

  // Question navigation and actions in CBT
  const handleSelectOption = (key: string) => {
    if (!currentQuestion) return;
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        selectedOption: key,
      },
    }));
  };

  const handleToggleMsqOption = (key: string) => {
    if (!currentQuestion) return;
    const currentSelected = responses[currentQuestion.id]?.selectedOptions || [];
    const nextSelected = currentSelected.includes(key)
      ? currentSelected.filter(k => k !== key)
      : [...currentSelected, key];

    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        selectedOptions: nextSelected,
      },
    }));
  };

  const handleNatChange = (val: string) => {
    if (!currentQuestion) return;
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        natAnswer: val,
      },
    }));
  };

  const handleSaveAndNext = () => {
    if (!currentQuestion || !activeTest) return;
    const resp = responses[currentQuestion.id];
    const hasAnswer =
      resp?.selectedOption || (resp?.selectedOptions && resp.selectedOptions.length > 0) || resp?.natAnswer;

    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        status: hasAnswer ? 'answered' : 'not_answered',
      },
    }));

    if (currentQuestionIndex < activeTest.questions.length - 1) {
      const nextQ = activeTest.questions[currentQuestionIndex + 1];
      setResponses(prev => ({
        ...prev,
        [nextQ.id]: {
          ...prev[nextQ.id],
          status: prev[nextQ.id].status === 'not_visited' ? 'not_answered' : prev[nextQ.id].status,
        },
      }));
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleMarkForReviewAndNext = () => {
    if (!currentQuestion || !activeTest) return;
    const resp = responses[currentQuestion.id];
    const hasAnswer =
      resp?.selectedOption || (resp?.selectedOptions && resp.selectedOptions.length > 0) || resp?.natAnswer;

    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        status: hasAnswer ? 'answered_marked_for_review' : 'marked_for_review',
      },
    }));

    if (currentQuestionIndex < activeTest.questions.length - 1) {
      const nextQ = activeTest.questions[currentQuestionIndex + 1];
      setResponses(prev => ({
        ...prev,
        [nextQ.id]: {
          ...prev[nextQ.id],
          status: prev[nextQ.id].status === 'not_visited' ? 'not_answered' : prev[nextQ.id].status,
        },
      }));
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleClearResponse = () => {
    if (!currentQuestion) return;
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        selectedOption: undefined,
        selectedOptions: [],
        natAnswer: undefined,
        status: 'not_answered',
      },
    }));
  };

  const jumpToQuestion = (index: number) => {
    if (!activeTest) return;
    const targetQ = activeTest.questions[index];
    setResponses(prev => ({
      ...prev,
      [targetQ.id]: {
        ...prev[targetQ.id],
        status: prev[targetQ.id].status === 'not_visited' ? 'not_answered' : prev[targetQ.id].status,
      },
    }));
    setCurrentQuestionIndex(index);
  };

  const handleSubmitTest = () => {
    if (!activeTest) return;

    let totalScore = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let attemptedCount = 0;

    const topicStats: Record<string, { correct: number; total: number; score: number }> = {};
    const finalResponses = { ...responses };

    activeTest.questions.forEach(q => {
      const resp = finalResponses[q.id];
      if (!topicStats[q.topic]) {
        topicStats[q.topic] = { correct: 0, total: 0, score: 0 };
      }
      topicStats[q.topic].total += 1;

      let isCorrect = false;
      let marksAwarded = 0;
      let attempted = false;

      if (q.type === 'MCQ') {
        if (resp?.selectedOption) {
          attempted = true;
          if (resp.selectedOption === q.correctAnswer) {
            isCorrect = true;
            marksAwarded = q.marks;
          } else {
            marksAwarded = -q.negativeMarks;
          }
        }
      } else if (q.type === 'MSQ') {
        if (resp?.selectedOptions && resp.selectedOptions.length > 0) {
          attempted = true;
          const userArr = [...resp.selectedOptions].sort();
          const corrArr = [...(q.correctAnswer as string[])].sort();
          if (JSON.stringify(userArr) === JSON.stringify(corrArr)) {
            isCorrect = true;
            marksAwarded = q.marks;
          } else {
            marksAwarded = 0; // No negative marking in MSQ
          }
        }
      } else if (q.type === 'NAT') {
        if (resp?.natAnswer !== undefined && resp.natAnswer.trim() !== '') {
          attempted = true;
          const userVal = parseFloat(resp.natAnswer);
          const corrVal = Number(q.correctAnswer);
          if (Math.abs(userVal - corrVal) < 0.05) {
            isCorrect = true;
            marksAwarded = q.marks;
          } else {
            marksAwarded = 0; // No negative marking in NAT
          }
        }
      }

      if (attempted) {
        attemptedCount++;
        if (isCorrect) {
          correctCount++;
          topicStats[q.topic].correct += 1;
        } else {
          incorrectCount++;
        }
      }

      totalScore += marksAwarded;
      topicStats[q.topic].score += marksAwarded;

      finalResponses[q.id] = {
        ...resp,
        isCorrect,
        marksAwarded,
      };
    });

    const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;
    const timeSpent = activeTest.durationMinutes * 60 - secondsRemaining;

    const topicAnalysis = Object.keys(topicStats).map(topic => ({
      topic,
      correct: topicStats[topic].correct,
      total: topicStats[topic].total,
      score: Number(topicStats[topic].score.toFixed(2)),
    }));

    const result: TestResult = {
      id: `res-${Date.now()}`,
      testId: activeTest.id,
      testTitle: activeTest.title,
      branchCode: activeTest.branchCode,
      submittedAt: new Date().toISOString(),
      score: Number(totalScore.toFixed(2)),
      totalMarks: activeTest.totalMarks,
      accuracy,
      totalTimeSeconds: timeSpent,
      questionsAttempted: attemptedCount,
      correctAnswers: correctCount,
      incorrectAnswers: incorrectCount,
      unattempted: activeTest.questions.length - attemptedCount,
      topicAnalysis,
      responses: finalResponses,
    };

    saveTestResult(result);
    setLatestResult(result);
    setViewState('result_view');
  };

  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle reveal solution in practice bank
  const toggleSolution = (qid: string) => {
    setRevealedSolutions(prev => ({ ...prev, [qid]: !prev[qid] }));
  };

  // -------------------------------------------------------------
  // VIEW 1: CBT EXAM SIMULATOR
  // -------------------------------------------------------------
  if (viewState === 'cbt_exam' && activeTest && currentQuestion) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-100 dark:bg-slate-950 flex flex-col font-sans select-none">
        {/* CBT Header */}
        <header className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between border-b border-slate-700 shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-sm sm:text-base tracking-wide bg-indigo-600 px-2.5 py-1 rounded">
              GATE CBT
            </span>
            <div className="hidden sm:block">
              <span className="text-xs font-semibold text-slate-200">{activeTest.title}</span>
              <span className="text-[10px] text-slate-400 block">Paper: [{activeTest.branchCode}]</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Virtual Calculator Trigger */}
            <button
              onClick={() => setIsCalculatorOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Calculator</span>
            </button>

            {/* Time Left Clock */}
            <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
              <Clock className="w-4 h-4 text-emerald-400 animate-pulse" />
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block leading-none">Time Left:</span>
                <span className="text-xs sm:text-sm font-mono font-bold text-emerald-400">
                  {formatTimer(secondsRemaining)}
                </span>
              </div>
            </div>

            {/* Candidate Info Badge */}
            <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-700 text-xs">
              <div className="w-8 h-8 rounded-full bg-blue-600 font-bold flex items-center justify-center text-white">
                {user ? user.name.charAt(0) : 'C'}
              </div>
              <div className="text-left">
                <div className="font-bold text-slate-200">{user ? user.name : 'Candidate'}</div>
                <div className="text-[10px] text-slate-400">Reg: 27CS91024</div>
              </div>
            </div>
          </div>
        </header>

        {/* CBT Body: Left (Question Area) & Right (Palette) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Question Display Column */}
          <main className="flex-1 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto">
            {/* Question Info Bar */}
            <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Question No. {currentQuestionIndex + 1}
                </span>
                <span className="px-2 py-0.5 rounded font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  {currentQuestion.type}
                </span>
                <span className="text-slate-500">
                  Subject: <strong className="text-slate-700 dark:text-slate-300">{currentQuestion.subject}</strong>
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleBookmarkQuestion(currentQuestion.id)}
                  className={`flex items-center gap-1 text-xs font-semibold transition ${
                    bookmarkedQuestionIds.includes(currentQuestion.id)
                      ? 'text-amber-500'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Bookmark className="w-4 h-4 fill-current" />
                  <span>{bookmarkedQuestionIds.includes(currentQuestion.id) ? 'Bookmarked' : 'Bookmark'}</span>
                </button>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  +{currentQuestion.marks} Mark{currentQuestion.marks > 1 ? 's' : ''}
                </span>
                {currentQuestion.negativeMarks > 0 && (
                  <span className="font-bold text-rose-500">
                    -{currentQuestion.negativeMarks} Neg
                  </span>
                )}
              </div>
            </div>

            {/* Question Statement */}
            <div className="p-6 flex-1 space-y-6">
              <div className="text-sm sm:text-base font-medium text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-line">
                {currentQuestion.questionText}
              </div>

              {/* Options Section */}
              {currentQuestion.type === 'MCQ' && currentQuestion.options && (
                <div className="space-y-3 pt-2">
                  {currentQuestion.options.map(opt => {
                    const isSelected = currentResponse?.selectedOption === opt.key;
                    return (
                      <div
                        key={opt.key}
                        onClick={() => handleSelectOption(opt.key)}
                        className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-600 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20 shadow-sm'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full border flex items-center justify-center font-bold text-xs ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'border-slate-300 dark:border-slate-600 text-slate-600'
                          }`}
                        >
                          {opt.key}
                        </div>
                        <div className="text-xs sm:text-sm font-medium">{opt.text}</div>
                      </div>
                    );
                  })}
                </div>
              )}

              {currentQuestion.type === 'MSQ' && currentQuestion.options && (
                <div className="space-y-3 pt-2">
                  <div className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                    * Multiple Select Question: One or more options may be correct. No negative marks.
                  </div>
                  {currentQuestion.options.map(opt => {
                    const isSelected = currentResponse?.selectedOptions?.includes(opt.key);
                    return (
                      <div
                        key={opt.key}
                        onClick={() => handleToggleMsqOption(opt.key)}
                        className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-600 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20 shadow-sm'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded border flex items-center justify-center font-bold text-xs ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'border-slate-300 text-slate-600'
                          }`}
                        >
                          {isSelected ? '✓' : opt.key}
                        </div>
                        <div className="text-xs sm:text-sm font-medium">{opt.text}</div>
                      </div>
                    );
                  })}
                </div>
              )}

              {currentQuestion.type === 'NAT' && (
                <div className="space-y-3 pt-2 max-w-sm">
                  <div className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                    * Numerical Answer Type: Enter a real or integer numerical value.
                  </div>
                  <input
                    type="number"
                    step="any"
                    placeholder="Enter numerical answer..."
                    value={currentResponse?.natAnswer || ''}
                    onChange={e => handleNatChange(e.target.value)}
                    className="w-full p-3 font-mono text-lg font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Use official Virtual Calculator above for trigonometric or complex math.</span>
                  </div>
                </div>
              )}
            </div>

            {/* CBT Bottom Action Buttons */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClearResponse}
                  className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Clear Response
                </button>
                <button
                  onClick={handleMarkForReviewAndNext}
                  className="px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-sm"
                >
                  Mark for Review & Next
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => jumpToQuestion(Math.max(0, currentQuestionIndex - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 disabled:opacity-40 font-semibold"
                >
                  Previous
                </button>
                <button
                  onClick={handleSaveAndNext}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
                >
                  Save & Next
                </button>
              </div>
            </div>
          </main>

          {/* Question Palette Sidebar */}
          <aside className="w-full md:w-80 bg-slate-50 dark:bg-slate-900/90 border-l border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Question Palette
              </h4>

              {/* Palette Legend */}
              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-emerald-500 text-white text-center font-bold">1</span>
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-rose-500 text-white text-center font-bold">1</span>
                  <span>Not Answered</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-purple-600 text-white text-center font-bold">1</span>
                  <span>Review Later</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-slate-300 dark:bg-slate-700 text-slate-800 text-center font-bold">1</span>
                  <span>Not Visited</span>
                </div>
              </div>

              {/* Grid of Question Buttons */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="grid grid-cols-5 gap-2">
                  {activeTest.questions.map((q, idx) => {
                    const st = responses[q.id]?.status || 'not_visited';
                    let bg = 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300';

                    if (st === 'answered') bg = 'bg-emerald-500 text-white font-bold';
                    else if (st === 'not_answered') bg = 'bg-rose-500 text-white font-bold';
                    else if (st === 'marked_for_review') bg = 'bg-purple-600 text-white font-bold';
                    else if (st === 'answered_marked_for_review')
                      bg = 'bg-purple-600 text-white font-bold ring-2 ring-emerald-400';

                    const isCurrent = idx === currentQuestionIndex;

                    return (
                      <button
                        key={q.id}
                        onClick={() => jumpToQuestion(idx)}
                        className={`h-9 rounded-lg text-xs font-mono transition transform active:scale-95 ${bg} ${
                          isCurrent ? 'ring-2 ring-blue-500 scale-105' : ''
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 mt-6">
              <button
                onClick={handleSubmitTest}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg transition"
              >
                Submit Examination
              </button>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: SCORECARD & PERFORMANCE ANALYSIS
  // -------------------------------------------------------------
  if (viewState === 'result_view' && latestResult && activeTest) {
    return (
      <div className="space-y-6 pb-12">
        {/* Results Banner */}
        <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-950 text-white p-6 sm:p-8 rounded-3xl border border-indigo-800 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Test Completed • Score Analysis</span>
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                {latestResult.testTitle}
              </h1>
              <p className="text-xs text-slate-300 mt-1">
                Submitted on {new Date(latestResult.submittedAt).toLocaleString()}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewState('catalog')}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition"
              >
                Back to Tests
              </button>
              <button
                onClick={() => handleStartTest(activeTest)}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow"
              >
                Retake Test
              </button>
            </div>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur border border-white/10 text-center">
              <span className="text-2xl sm:text-4xl font-extrabold font-mono text-emerald-300 block">
                {latestResult.score} / {latestResult.totalMarks}
              </span>
              <span className="text-[11px] font-medium text-slate-300 uppercase">Total Marks</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur border border-white/10 text-center">
              <span className="text-2xl sm:text-4xl font-extrabold font-mono text-blue-300 block">
                {latestResult.accuracy}%
              </span>
              <span className="text-[11px] font-medium text-slate-300 uppercase">Accuracy</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur border border-white/10 text-center">
              <span className="text-2xl sm:text-4xl font-extrabold font-mono text-amber-300 block">
                {latestResult.correctAnswers} / {latestResult.questionsAttempted}
              </span>
              <span className="text-[11px] font-medium text-slate-300 uppercase">Correct / Attempted</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur border border-white/10 text-center">
              <span className="text-2xl sm:text-4xl font-extrabold font-mono text-purple-300 block">
                {Math.round(latestResult.totalTimeSeconds / 60)}m
              </span>
              <span className="text-[11px] font-medium text-slate-300 uppercase">Time Taken</span>
            </div>
          </div>
        </div>

        {/* Topic Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Topic-Wise Performance Breakdown
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {latestResult.topicAnalysis.map((item, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs"
              >
                <div className="font-bold text-slate-800 dark:text-slate-200 truncate">{item.topic}</div>
                <div className="flex items-center justify-between text-slate-500 mt-1">
                  <span>Correct: {item.correct}/{item.total}</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{item.score} Marks</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Question by Question Review & Solutions */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Detailed Step-by-Step Solutions & Error Analysis
          </h3>

          <div className="space-y-4">
            {activeTest.questions.map((q, idx) => {
              const resp = latestResult.responses[q.id];
              const isCorrect = resp?.isCorrect;
              const isAttempted =
                resp?.selectedOption || (resp?.selectedOptions && resp.selectedOptions.length > 0) || resp?.natAnswer;

              return (
                <div
                  key={q.id}
                  className={`p-6 rounded-2xl border transition ${
                    isCorrect
                      ? 'bg-emerald-50/20 border-emerald-300 dark:border-emerald-800'
                      : isAttempted
                      ? 'bg-rose-50/20 border-rose-300 dark:border-rose-800'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">Q{idx + 1}.</span>
                      <span className="font-semibold text-slate-500">[{q.subject} • {q.topic}]</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCorrect ? (
                        <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" /> Correct (+{resp?.marksAwarded})
                        </span>
                      ) : isAttempted ? (
                        <span className="flex items-center gap-1 font-bold text-rose-500">
                          <XCircle className="w-4 h-4" /> Incorrect ({resp?.marksAwarded})
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">Unattempted (0)</span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm font-medium text-slate-900 dark:text-white leading-relaxed">
                    {q.questionText}
                  </p>

                  {/* Options with marked indicator */}
                  {q.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-3 text-xs">
                      {q.options.map(opt => {
                        const isThisCorrect = Array.isArray(q.correctAnswer)
                          ? (q.correctAnswer as (string | number)[]).map(String).includes(opt.key)
                          : String(q.correctAnswer) === opt.key;
                        const isUserChoice =
                          resp?.selectedOption === opt.key || resp?.selectedOptions?.includes(opt.key);

                        let optClass = 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800';
                        if (isThisCorrect) {
                          optClass = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 font-bold text-emerald-800 dark:text-emerald-200';
                        } else if (isUserChoice && !isThisCorrect) {
                          optClass = 'border-rose-400 bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200';
                        }

                        return (
                          <div key={opt.key} className={`p-2.5 rounded-xl border flex items-center gap-2 ${optClass}`}>
                            <span className="font-bold">({opt.key})</span>
                            <span>{opt.text}</span>
                            {isThisCorrect && <span className="ml-auto text-emerald-600 font-bold">✓ Correct Answer</span>}
                            {isUserChoice && !isThisCorrect && <span className="ml-auto text-rose-500 font-bold">Your Choice</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Explanation box */}
                  <div className="mt-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider text-[10px] block mb-1">
                      Official Solution & Step-by-Step Explanation:
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                      {q.solutionExplanation}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 3: CATALOG & PRACTICE BANK
  // -------------------------------------------------------------
  const filteredPracticeQuestions = PRACTICE_QUESTIONS.filter(q => {
    if (practiceSubjectFilter !== 'ALL' && q.subject !== practiceSubjectFilter) return false;
    if (practiceTypeFilter !== 'ALL' && q.type !== practiceTypeFilter) return false;
    if (practiceDifficulty !== 'ALL' && q.difficulty !== practiceDifficulty) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              GATE Mock Tests & Practice Hub
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Simulate realistic CBT examination conditions or solve previous-year GATE questions with instant step-by-step solutions.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setViewState('catalog')}
            className={`px-3 py-1.5 rounded-lg transition ${
              viewState === 'catalog'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            CBT Mock Exams
          </button>
          <button
            onClick={() => setViewState('practice_bank')}
            className={`px-3 py-1.5 rounded-lg transition ${
              viewState === 'practice_bank'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            PYQ Practice Bank
          </button>
        </div>
      </div>

      {/* CBT MOCKS CATALOG */}
      {viewState === 'catalog' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {MOCK_TESTS_CATALOG.map(test => {
              return (
                <div
                  key={test.id}
                  className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500 transition-all space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        {test.difficulty}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1.5">
                        {test.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {test.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs py-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Duration</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{test.durationMinutes} Mins</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Total Marks</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{test.totalMarks} Marks</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Questions</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{test.questions.length} Items</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartTest(test)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                  >
                    <span>Launch CBT Test Interface</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PRACTICE BANK VIEW */}
      {viewState === 'practice_bank' && (
        <div className="space-y-5">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
            <span className="font-bold text-slate-500">Filters:</span>
            <select
              value={practiceTypeFilter}
              onChange={e => setPracticeTypeFilter(e.target.value)}
              className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            >
              <option value="ALL">All Question Types (MCQ, MSQ, NAT)</option>
              <option value="MCQ">MCQ (Multiple Choice)</option>
              <option value="MSQ">MSQ (Multiple Select)</option>
              <option value="NAT">NAT (Numerical Answer)</option>
            </select>

            <select
              value={practiceDifficulty}
              onChange={e => setPracticeDifficulty(e.target.value)}
              className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            >
              <option value="ALL">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {/* Question List */}
          <div className="space-y-4">
            {filteredPracticeQuestions.map((q, idx) => {
              const isSolutionOpen = revealedSolutions[q.id];
              const isBookmarked = bookmarkedQuestionIds.includes(q.id);

              return (
                <div
                  key={q.id}
                  className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">Q{idx + 1}.</span>
                      <span className="px-2 py-0.5 rounded font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                        {q.type}
                      </span>
                      <span className="text-slate-500">[{q.subject} • {q.topic}]</span>
                      {q.year && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                          GATE {q.year} PYQ
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => toggleBookmarkQuestion(q.id)}
                      className={`flex items-center gap-1 text-xs font-semibold ${
                        isBookmarked ? 'text-amber-500' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5 fill-current" />
                      <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
                    </button>
                  </div>

                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 whitespace-pre-line leading-relaxed">
                    {q.questionText}
                  </p>

                  {q.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                      {q.options.map(opt => (
                        <div
                          key={opt.key}
                          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center gap-2"
                        >
                          <span className="font-bold text-slate-700 dark:text-slate-300">({opt.key})</span>
                          <span>{opt.text}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      onClick={() => toggleSolution(q.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isSolutionOpen ? 'Hide Solution' : 'View Correct Answer & Explanation'}</span>
                    </button>
                  </div>

                  {isSolutionOpen && (
                    <div className="mt-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                      <div className="font-bold text-emerald-600 dark:text-emerald-400">
                        Correct Answer: {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : String(q.correctAnswer)}
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                        {q.solutionExplanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
