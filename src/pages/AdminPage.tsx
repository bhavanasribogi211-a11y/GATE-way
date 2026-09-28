import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BRANCHES_INFO } from '../data/branchesData';
import { BranchCode, ExamNotification } from '../types';
import {
  ShieldAlert,
  Plus,
  CheckCircle2,
  Trash2,
  Edit,
  Save,
  BookOpen,
  Bell,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AdminPage: React.FC = () => {
  const {
    syllabusMap,
    selectedBranch,
    notifications,
    addNotification,
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState<'notifications' | 'syllabus' | 'resources'>('notifications');

  // New notification form
  const [notifTitle, setNotifTitle] = useState('');
  const [notifCategory, setNotifCategory] = useState<ExamNotification['category']>('Registration');
  const [notifDate, setNotifDate] = useState(new Date().toISOString().slice(0, 10));
  const [notifDeadline, setNotifDeadline] = useState('');
  const [notifStatus, setNotifStatus] = useState<'Upcoming' | 'Active' | 'Closed'>('Active');
  const [notifSource, setNotifSource] = useState('Official Organizing Institute Press Note');
  const [notifUrl, setNotifUrl] = useState('https://gate.iit.ac.in');
  const [notifSummary, setNotifSummary] = useState('');
  const [notifAction, setNotifAction] = useState('');
  const [notifSuccess, setNotifSuccess] = useState(false);

  // New syllabus subtopic form
  const [subBranch, setSubBranch] = useState<BranchCode>(selectedBranch);
  const [targetSubjectId, setTargetSubjectId] = useState('');
  const [newSubtopicTitle, setNewSubtopicTitle] = useState('');
  const [newSubtopicNotes, setNewSubtopicNotes] = useState('');
  const [syllabusSuccess, setSyllabusSuccess] = useState(false);

  const handlePublishNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle) return;

    addNotification({
      id: `admin-notif-${Date.now()}`,
      title: notifTitle,
      category: notifCategory,
      date: notifDate,
      deadline: notifDeadline || undefined,
      status: notifStatus,
      isOfficial: true,
      officialSource: notifSource,
      officialUrl: notifUrl,
      summary: notifSummary,
      actionRequired: notifAction || undefined,
      read: false,
      reminderSet: true,
      important: true,
    });

    setNotifSuccess(true);
    confetti({ particleCount: 40, spread: 60 });
    setNotifTitle('');
    setNotifSummary('');
    setNotifAction('');
    setTimeout(() => setNotifSuccess(false), 3000);
  };

  const handleAddSyllabusSubtopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtopicTitle) return;

    const branchObj = syllabusMap[subBranch];
    if (!branchObj) return;

    const subj = branchObj.subjects.find(s => s.id === targetSubjectId) || branchObj.subjects[0];
    if (subj) {
      subj.subtopics.push({
        id: `custom-sub-${Date.now()}`,
        title: newSubtopicTitle,
        completed: false,
        notes: newSubtopicNotes || 'Admin added curriculum topic.',
        pyqCount: 10,
      });

      setSyllabusSuccess(true);
      confetti({ particleCount: 40, spread: 60 });
      setNewSubtopicTitle('');
      setNewSubtopicNotes('');
      setTimeout(() => setSyllabusSuccess(false), 3000);
    }
  };

  const currentBranchObj = syllabusMap[subBranch] || syllabusMap.CS;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl border border-purple-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Admin Control Panel • Authorized Management</span>
          </div>
          <h1 className="text-2xl font-bold text-white">GATE Portal Administrator</h1>
          <p className="text-xs text-purple-200 mt-0.5">
            Publish verified exam announcements, modify syllabus topics, and curate reference resources.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950/60 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveAdminTab('notifications')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeAdminTab === 'notifications'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Notifications Manager
          </button>
          <button
            onClick={() => setActiveAdminTab('syllabus')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeAdminTab === 'syllabus'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Syllabus Manager
          </button>
        </div>
      </div>

      {/* TAB 1: NOTIFICATIONS MANAGER */}
      {activeAdminTab === 'notifications' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b pb-4 border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-purple-600" />
                <span>Publish Official GATE Announcement</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pushes directly to student alert feeds, banner indicators, and browser push notifications.
              </p>
            </div>
          </div>

          {notifSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Official announcement broadcasted successfully!</span>
            </div>
          )}

          <form onSubmit={handlePublishNotification} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Announcement Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GATE 2027 Registration Fee Payment Gateway Maintenance"
                  value={notifTitle}
                  onChange={e => setNotifTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Category
                </label>
                <select
                  value={notifCategory}
                  onChange={e => setNotifCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="Registration">Registration</option>
                  <option value="Admit Card">Admit Card</option>
                  <option value="Exam Date">Exam Date</option>
                  <option value="Answer Key">Answer Key</option>
                  <option value="Result">Result</option>
                  <option value="Counseling">Counseling</option>
                  <option value="Rule Change">Rule Change</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Release Date
                </label>
                <input
                  type="date"
                  value={notifDate}
                  onChange={e => setNotifDate(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Deadline Date (Optional)
                </label>
                <input
                  type="date"
                  value={notifDeadline}
                  onChange={e => setNotifDeadline(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Current Status
                </label>
                <select
                  value={notifStatus}
                  onChange={e => setNotifStatus(e.target.value as any)}
                  className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="Active">Active</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Official Source / Issuing Body
                </label>
                <input
                  type="text"
                  value={notifSource}
                  onChange={e => setNotifSource(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Official URL
                </label>
                <input
                  type="url"
                  value={notifUrl}
                  onChange={e => setNotifUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Announcement Details / Summary
              </label>
              <textarea
                rows={3}
                required
                placeholder="Comprehensive text of the notification as verified by the institute..."
                value={notifSummary}
                onChange={e => setNotifSummary(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Required Student Action
              </label>
              <input
                type="text"
                placeholder="e.g. Verify photograph dimensions before re-uploading"
                value={notifAction}
                onChange={e => setNotifAction(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition"
              >
                Broadcast Official Announcement
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: SYLLABUS MANAGER */}
      {activeAdminTab === 'syllabus' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b pb-4 border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <span>Add Syllabus Topic or Subtopic</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Update the official curriculum for any GATE branch paper.
              </p>
            </div>
          </div>

          {syllabusSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Syllabus subtopic appended and saved!</span>
            </div>
          )}

          <form onSubmit={handleAddSyllabusSubtopic} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Target Engineering Paper
                </label>
                <select
                  value={subBranch}
                  onChange={e => setSubBranch(e.target.value as BranchCode)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                >
                  {BRANCHES_INFO.map(b => (
                    <option key={b.code} value={b.code}>
                      [{b.code}] {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Subject Section
                </label>
                <select
                  value={targetSubjectId || (currentBranchObj.subjects[0]?.id || '')}
                  onChange={e => setTargetSubjectId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  {currentBranchObj.subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.weightagePercentage}%)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                New Subtopic Title & Scope
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Attention Mechanisms in Large Language Models & Positional Embeddings"
                value={newSubtopicTitle}
                onChange={e => setNewSubtopicTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Conceptual Notes & Formula References
              </label>
              <textarea
                rows={3}
                placeholder="Guidance on key theorems, expected question patterns, and PYQ tips..."
                value={newSubtopicNotes}
                onChange={e => setNewSubtopicNotes(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition"
              >
                Add Subtopic to Official Syllabus
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
