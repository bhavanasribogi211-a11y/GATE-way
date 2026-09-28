import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { STUDY_RESOURCES } from '../data/resourcesData';
import { StudyResource } from '../types';
import {
  BookMarked,
  Download,
  ExternalLink,
  FileText,
  Calculator,
  Award,
  BookOpen,
  Search,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const ResourcesPage: React.FC = () => {
  const { selectedBranch, setIsCalculatorOpen } = useApp();
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [readingResource, setReadingResource] = useState<StudyResource | null>(null);

  const filtered = STUDY_RESOURCES.filter(res => {
    if (activeCategory !== 'ALL' && res.category !== activeCategory) return false;
    if (res.branchCode !== 'ALL' && res.branchCode !== selectedBranch) {
      // allow seeing resources
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return res.title.toLowerCase().includes(q) || res.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookMarked className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              GATE Study Resources & Formula Capsules
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Handcrafted formula sheets, standard textbook recommendations, PYQ archives, and Virtual Calculator operational guides.
          </p>
        </div>

        <button
          onClick={() => setIsCalculatorOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300/80 dark:border-amber-700 hover:bg-amber-100 transition shadow-sm"
        >
          <Calculator className="w-4 h-4 text-amber-600" />
          <span>Launch Virtual Calc</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs font-semibold">
        <div className="flex flex-wrap items-center gap-1">
          {['ALL', 'Formula Sheet', 'Reference Books', 'PYQ Archive', 'Virtual Calculator Guide', 'Topper Strategies'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeCategory === cat
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat === 'ALL' ? 'All Resources' : cat}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search resources & formula sheets..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 w-full sm:w-60 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(res => (
          <div
            key={res.id}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-cyan-500 transition-all space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300">
                  {res.category}
                </span>
                {res.fileSize && (
                  <span className="text-[10px] text-slate-400 font-mono">{res.fileSize}</span>
                )}
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                {res.title}
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {res.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              {res.content ? (
                <button
                  onClick={() => setReadingResource(res)}
                  className="font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Read Guide & Notes</span>
                </button>
              ) : (
                <span className="text-slate-400 text-[11px]">Official PDF Archive</span>
              )}

              <button
                onClick={() => {
                  if (res.content) setReadingResource(res);
                  else alert('Download initiated for ' + res.title);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
              >
                <Download className="w-3 h-3" />
                <span>Access</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Reader Modal */}
      {readingResource && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 sm:p-8 space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <span className="text-xs font-bold text-cyan-600 uppercase tracking-wider block mb-1">
                  {readingResource.category}
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {readingResource.title}
                </h2>
              </div>
              <button
                onClick={() => setReadingResource(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
              {readingResource.content}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setReadingResource(null)}
                className="px-5 py-2 rounded-xl bg-cyan-600 text-white font-bold text-xs shadow hover:bg-cyan-700"
              >
                Done Reading
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
