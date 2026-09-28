import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BRANCHES_INFO } from '../data/branchesData';
import { BranchCode, PrepLevel } from '../types';
import {
  User,
  Mail,
  Calendar,
  Clock,
  Shield,
  Download,
  Upload,
  LogOut,
  CheckCircle2,
  Lock,
  Smartphone,
  Save,
  KeyRound,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ProfilePage: React.FC = () => {
  const {
    user,
    updateProfile,
    login,
    loginDemoUser,
    logout,
    selectedBranch,
    exportBackupData,
    importBackupData,
  } = useApp();

  // Local form state
  const [name, setName] = useState(user?.name || 'Arjun Sharma');
  const [email, setEmail] = useState(user?.email || 'arjun.gate2027@example.com');
  const [branch, setBranch] = useState<BranchCode>(user?.branch || selectedBranch);
  const [targetYear, setTargetYear] = useState(user?.targetYear || 2027);
  const [dailyGoalHours, setDailyGoalHours] = useState(user?.dailyGoalHours || 4);
  const [prepLevel, setPrepLevel] = useState<PrepLevel>(user?.prepLevel || 'Intermediate');
  const [emailAlerts, setEmailAlerts] = useState(user?.emailAlerts ?? true);
  const [browserNotifications, setBrowserNotifications] = useState(user?.browserNotifications ?? true);

  // Password reset state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Login/Signup form state when logged out
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authBranch, setAuthBranch] = useState<BranchCode>('CS');
  const [authYear, setAuthYear] = useState(2027);

  // Backup import state
  const [importJson, setImportJson] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      email,
      branch,
      targetYear,
      dailyGoalHours,
      prepLevel,
      emailAlerts,
      browserNotifications,
    });
    setProfileSuccess(true);
    confetti({ particleCount: 30, spread: 50 });
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('New password and confirmation do not match.');
      return;
    }
    setPasswordSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(authName || 'Candidate', authEmail || 'aspirant@gate.ac.in', authBranch, authYear);
  };

  const handleImportSubmit = () => {
    if (!importJson.trim()) return;
    const ok = importBackupData(importJson);
    if (ok) {
      setImportStatus('Data successfully restored!');
      setImportJson('');
      confetti({ particleCount: 50, spread: 70 });
    } else {
      setImportStatus('Invalid JSON backup file. Please verify format.');
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {authMode === 'login' ? 'Sign In to GATE Prep Planner' : 'Create Student Account'}
          </h2>
          <p className="text-xs text-slate-500">
            Save your study timetable, track syllabus completion, and record CBT mock test scores.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <form onSubmit={handleAuthSubmit} className="space-y-3.5 text-xs">
            {authMode === 'signup' && (
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Nair"
                  value={authName}
                  onChange={e => setAuthName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
            )}

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="name@university.edu"
                value={authEmail}
                onChange={e => setAuthEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  GATE Paper
                </label>
                <select
                  value={authBranch}
                  onChange={e => setAuthBranch(e.target.value as any)}
                  className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  {BRANCHES_INFO.map(b => (
                    <option key={b.code} value={b.code}>
                      [{b.code}] {b.shortName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Target Year
                </label>
                <select
                  value={authYear}
                  onChange={e => setAuthYear(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  <option value={2027}>2027</option>
                  <option value={2028}>2028</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition"
            >
              {authMode === 'login' ? 'Sign In' : 'Create My Account'}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <button
              onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              {authMode === 'login' ? 'Need an account? Sign up' : 'Already registered? Sign in'}
            </button>

            <button
              onClick={loginDemoUser}
              className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline font-medium"
            >
              Try Demo Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            {user.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{user.name}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                Paper: [{user.branch}]
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                GATE {user.targetYear}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {profileSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Profile and timetable preferences updated successfully!</span>
        </div>
      )}

      {/* Main Settings Form */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white border-b pb-3 border-slate-100 dark:border-slate-800">
          Personal Details & Examination Preferences
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Registered Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Engineering Paper
              </label>
              <select
                value={branch}
                onChange={e => setBranch(e.target.value as BranchCode)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
              >
                {BRANCHES_INFO.map(b => (
                  <option key={b.code} value={b.code}>
                    [{b.code}] {b.shortName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Target Exam Year
              </label>
              <select
                value={targetYear}
                onChange={e => setTargetYear(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              >
                <option value={2027}>GATE 2027</option>
                <option value={2028}>GATE 2028</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Daily Study Goal: {dailyGoalHours} Hours
              </label>
              <input
                type="range"
                min={2}
                max={10}
                value={dailyGoalHours}
                onChange={e => setDailyGoalHours(Number(e.target.value))}
                className="w-full accent-indigo-600 mt-2"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Current Preparation Diagnostic Level
            </label>
            <div className="grid grid-cols-3 gap-3">
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
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">
              Notification & Deadline Reminders
            </span>
            <div className="flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={e => setEmailAlerts(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span>Email alerts for GATE deadlines and result announcements</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={browserNotifications}
                  onChange={e => setBrowserNotifications(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span>Browser push notifications for daily study tasks</span>
              </label>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      </div>

      {/* Password Change Simulation Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-indigo-600" />
          <span>Security & Password Reset</span>
        </h3>

        {passwordSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Password updated securely!</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-3 text-xs max-w-md">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              New Password (Min 6 chars)
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition"
          >
            Update Password
          </button>
        </form>
      </div>

      {/* Data Export & Backup Restore Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Download className="w-4 h-4 text-emerald-600" />
          <span>Backup & Data Portability</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Export your entire preparation history including customized study timetable, marked syllabus subtopics, and CBT mock scores as a portable JSON file.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={exportBackupData}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Download Backup (JSON)</span>
          </button>
        </div>

        {/* Restore section */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
            Restore from JSON Backup:
          </span>
          <textarea
            rows={2}
            placeholder="Paste your JSON backup payload here..."
            value={importJson}
            onChange={e => setImportJson(e.target.value)}
            className="w-full p-2.5 font-mono text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
          />
          {importStatus && (
            <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{importStatus}</p>
          )}
          <button
            onClick={handleImportSubmit}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 text-xs font-semibold"
          >
            Restore Backup Data
          </button>
        </div>
      </div>
    </div>
  );
};
