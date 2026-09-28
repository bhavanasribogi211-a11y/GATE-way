import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ExamNotification } from '../types';
import {
  Bell,
  CheckCircle2,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Clock,
  Filter,
  Check,
  Send,
  Sliders,
  AlertCircle,
  Mail,
  Smartphone,
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const {
    notifications,
    markNotificationRead,
    toggleNotificationReminder,
    user,
    updateProfile,
    addNotification,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [activeStatus, setActiveStatus] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // New notification form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ExamNotification['category']>('Registration');
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10));
  const [newDeadline, setNewDeadline] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [newUrl, setNewUrl] = useState('https://gate.iit.ac.in');

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    notifications.forEach(n => {
      if (!n.read) markNotificationRead(n.id);
    });
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    addNotification({
      id: `custom-notif-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      date: newDate,
      deadline: newDeadline || undefined,
      status: 'Active',
      isOfficial: true,
      officialSource: 'Custom User Reminder',
      officialUrl: newUrl,
      summary: newSummary || 'Personalized alert for GATE preparation milestone.',
      read: false,
      reminderSet: true,
      important: true,
    });

    setNewTitle('');
    setNewSummary('');
    setShowAddModal(false);
  };

  const filtered = notifications.filter(notif => {
    if (activeCategory !== 'ALL' && notif.category !== activeCategory) return false;
    if (activeStatus !== 'ALL' && notif.status !== activeStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Verified Exam Notifications & Alerts
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white">
                {unreadCount} New
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time updates directly sourced from official IIT GATE organizing committees, COAP, and CCMT portals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
            >
              Mark All as Read
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-sm"
          >
            + Add Reminder
          </button>
        </div>
      </div>

      {/* Alert Preferences Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/40 border border-purple-200/80 dark:border-purple-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <Smartphone className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />
          <div>
            <span className="font-bold text-slate-900 dark:text-white block">
              Multi-Channel Alert Dispatcher
            </span>
            <span className="text-slate-600 dark:text-slate-300 text-[11px]">
              Receive proactive alerts 7 days and 24 hours prior to application and admit card deadlines.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={user?.emailAlerts ?? true}
              onChange={e => updateProfile({ emailAlerts: e.target.checked })}
              className="rounded text-purple-600"
            />
            <span>Email Alerts</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={user?.browserNotifications ?? true}
              onChange={e => updateProfile({ browserNotifications: e.target.checked })}
              className="rounded text-purple-600"
            />
            <span>Browser Push</span>
          </label>
        </div>
      </div>

      {/* Category and Status Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs font-semibold">
        <div className="flex flex-wrap items-center gap-1">
          {['ALL', 'Registration', 'Admit Card', 'Exam Date', 'Answer Key', 'Result', 'Counseling'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeCategory === cat
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat === 'ALL' ? 'All Alerts' : cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {['ALL', 'Active', 'Upcoming', 'Closed'].map(st => (
            <button
              key={st}
              onClick={() => setActiveStatus(st)}
              className={`px-2.5 py-1 rounded-lg text-[11px] transition ${
                activeStatus === st
                  ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow font-bold'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filtered.map(notif => {
          return (
            <div
              key={notif.id}
              className={`p-5 rounded-2xl border transition-all ${
                !notif.read
                  ? 'bg-white dark:bg-slate-900 border-purple-300 dark:border-purple-800 shadow-md ring-1 ring-purple-500/20'
                  : 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                      {notif.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        notif.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : notif.status === 'Upcoming'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {notif.status}
                    </span>
                    {notif.isOfficial && (
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verified Official</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {notif.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {notif.summary}
                  </p>

                  {notif.actionRequired && (
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 text-[11px] text-amber-800 dark:text-amber-200">
                      <strong>Action Required:</strong> {notif.actionRequired}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Release Date: {notif.date}</span>
                    </span>
                    {notif.deadline && (
                      <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Deadline: {notif.deadline}</span>
                      </span>
                    )}
                    <span>Source: {notif.officialSource}</span>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 pt-2 sm:pt-0">
                  <a
                    href={notif.officialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 transition"
                  >
                    <span>Official Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    onClick={() => toggleNotificationReminder(notif.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                      notif.reminderSet
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {notif.reminderSet ? '✓ Reminder Active' : 'Set Reminder'}
                  </button>

                  {!notif.read && (
                    <button
                      onClick={() => markNotificationRead(notif.id)}
                      className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-white"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Reminder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Add Custom Preparation Reminder
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustom} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Reminder Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Download GATE Admit Card laser printout"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="Registration">Registration</option>
                    <option value="Admit Card">Admit Card</option>
                    <option value="Exam Date">Exam Date</option>
                    <option value="Answer Key">Answer Key</option>
                    <option value="Result">Result</option>
                    <option value="Counseling">Counseling</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Summary / Note</label>
                <textarea
                  rows={3}
                  placeholder="Instructions, login credentials reminder, or checklist..."
                  value={newSummary}
                  onChange={e => setNewSummary(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 text-white font-bold rounded-xl shadow"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
