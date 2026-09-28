import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BRANCHES_INFO } from '../data/branchesData';
import { BranchCode, SyllabusSubject } from '../types';
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Search,
  ExternalLink,
  FileText,
  Bookmark,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Percent,
  Clock,
  ShieldCheck,
  Check,
  HelpCircle,
  Copy,
} from 'lucide-react';

export const SyllabusPage: React.FC = () => {
  const {
    syllabusMap,
    completedSubtopicIds,
    toggleSubtopicComplete,
    selectedBranch,
    setSelectedBranch,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);

  const currentBranch = BRANCHES_INFO.find(b => b.code === selectedBranch) || BRANCHES_INFO[0];
  const branchData = syllabusMap[selectedBranch] || syllabusMap.CS;

  const toggleExpand = (id: string) => {
    setExpandedSubjects(prev => ({
      ...prev,
      [id]: prev[id] === undefined ? false : !prev[id], // Default was open if undefined
    }));
  };

  const copyFormula = (formula: string) => {
    navigator.clipboard.writeText(formula);
    setCopiedFormula(formula);
    setTimeout(() => setCopiedFormula(null), 2000);
  };

  // Filter subjects by category & search
  const filteredSubjects = branchData.subjects.filter(subject => {
    if (activeCategory !== 'ALL' && subject.category !== activeCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const subjectMatch = subject.name.toLowerCase().includes(q);
      const subtopicMatch = subject.subtopics.some(sub => sub.title.toLowerCase().includes(q));
      return subjectMatch || subtopicMatch;
    }
    return true;
  });

  // Calculate overall stats
  let totalSubtopics = 0;
  let completedSubtopics = 0;
  branchData.subjects.forEach(s => {
    s.subtopics.forEach(sub => {
      totalSubtopics++;
      if (completedSubtopicIds.includes(sub.id)) completedSubtopics++;
    });
  });

  const overallPct = totalSubtopics > 0 ? Math.round((completedSubtopics / totalSubtopics) * 100) : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Official GATE Syllabus ({branchData.branchCode})
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {branchData.branchName} • Aligned with {branchData.lastUpdated}
          </p>
        </div>

        {/* Paper Selector Dropdown & Switcher */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 hidden sm:inline">Change Paper:</label>
          <select
            value={selectedBranch}
            onChange={e => setSelectedBranch(e.target.value as BranchCode)}
            className="p-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 focus:outline-none"
          >
            {BRANCHES_INFO.map(b => (
              <option key={b.code} value={b.code}>
                [{b.code}] {b.shortName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Official Verification Banner */}
      <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
          <span className="text-slate-700 dark:text-slate-300">
            <strong>Official Syllabus Status:</strong> Sourced directly from {branchData.officialSource}. Clearly distinguishes core required topics from supplementary notes.
          </span>
        </div>
        <div className="shrink-0 flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400">
          <span>Overall: {completedSubtopics}/{totalSubtopics} ({overallPct}%)</span>
        </div>
      </div>

      {/* Category Pills & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center gap-1 text-xs font-semibold">
          {['ALL', 'General Aptitude', 'Engineering Mathematics', 'Core Engineering'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat === 'ALL' ? 'All Sections' : cat}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search topics, formulas, concepts..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 w-full sm:w-64 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Subjects & Subtopics Accordion List */}
      <div className="space-y-4">
        {filteredSubjects.map(subject => {
          const isExpanded = expandedSubjects[subject.id] !== false; // Default open
          const subCount = subject.subtopics.length;
          const completedCount = subject.subtopics.filter(s => completedSubtopicIds.includes(s.id)).length;
          const subjectPct = subCount > 0 ? Math.round((completedCount / subCount) * 100) : 0;

          return (
            <div
              key={subject.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition"
            >
              {/* Subject Header */}
              <div
                onClick={() => toggleExpand(subject.id)}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 select-none border-b border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                    {subject.weightagePercentage}%
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {subject.name}
                      </h3>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {subject.category}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-3">
                      <span>{completedCount} of {subCount} topics mastered ({subjectPct}%)</span>
                      <span>•</span>
                      <span>~{subject.estimatedHours} hrs study allocation</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="w-28 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden hidden sm:block">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${subjectPct}%` }}
                    />
                  </div>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </div>
              </div>

              {/* Subject Body when expanded */}
              {isExpanded && (
                <div className="p-5 space-y-6">
                  {/* Short Notes & Official Guidance */}
                  {subject.shortNotes && (
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider text-[10px] block mb-1">
                        High-Yield Strategy & Core Insights:
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {subject.shortNotes}
                      </p>
                    </div>
                  )}

                  {/* Important Formulas & Rules Box */}
                  {subject.importantFormulas && subject.importantFormulas.length > 0 && (
                    <div className="p-4 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-900/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>Key Formulas & Identities</span>
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                        {subject.importantFormulas.map((formula, idx) => (
                          <div
                            key={idx}
                            onClick={() => copyFormula(formula)}
                            className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900/80 text-slate-800 dark:text-slate-200 flex items-center justify-between cursor-pointer hover:border-indigo-400 transition"
                            title="Click to copy formula"
                          >
                            <span className="truncate mr-2">{formula}</span>
                            {copiedFormula === formula ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Subtopics Checklist Table */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Subtopics & Topic-Wise Checklist:
                    </h4>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                      {subject.subtopics.map(subtopic => {
                        const isDone = completedSubtopicIds.includes(subtopic.id);

                        return (
                          <div
                            key={subtopic.id}
                            className={`p-3.5 flex items-start gap-3 transition ${
                              isDone
                                ? 'bg-slate-50/60 dark:bg-slate-800/30'
                                : 'bg-white dark:bg-slate-900 hover:bg-slate-50/40'
                            }`}
                          >
                            <button
                              onClick={() => toggleSubtopicComplete(subtopic.id)}
                              className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400"
                            >
                              {isDone ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                              ) : (
                                <Circle className="w-5 h-5 text-slate-400 hover:text-indigo-600" />
                              )}
                            </button>

                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span
                                  onClick={() => toggleSubtopicComplete(subtopic.id)}
                                  className={`text-xs font-bold cursor-pointer ${
                                    isDone
                                      ? 'line-through text-slate-400'
                                      : 'text-slate-800 dark:text-slate-200'
                                  }`}
                                >
                                  {subtopic.title}
                                </span>
                                {subtopic.pyqCount && (
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                                    {subtopic.pyqCount}+ Past GATE Questions
                                  </span>
                                )}
                              </div>

                              {subtopic.notes && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                  {subtopic.notes}
                                </p>
                              )}

                              {subtopic.pyqLinks && subtopic.pyqLinks.length > 0 && (
                                <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px]">
                                  <span className="text-slate-400 font-medium">Sample PYQs:</span>
                                  {subtopic.pyqLinks.map((pyq, i) => (
                                    <span
                                      key={i}
                                      className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono"
                                    >
                                      GATE {pyq.year} [{pyq.questionNo}]: {pyq.text}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
