import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BRANCHES_INFO } from '../data/branchesData';
import {
  GraduationCap,
  Calendar,
  BookOpen,
  Bell,
  CheckSquare,
  BarChart3,
  BookMarked,
  Calculator,
  Moon,
  Sun,
  User,
  Menu,
  X,
  FileSpreadsheet,
  ShieldAlert,
  Info,
  ChevronDown,
  Bot,
  Sparkles,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    selectedBranch,
    setSelectedBranch,
    theme,
    toggleTheme,
    notifications,
    user,
    setIsCalculatorOpen,
    isCalculatorOpen,
    isChatbotOpen,
    setIsChatbotOpen,
    toggleChatbot,
    loginDemoUser,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const currentBranchInfo = BRANCHES_INFO.find(b => b.code === selectedBranch) || BRANCHES_INFO[0];

  const navItems = [
    { id: 'home', label: 'Home', icon: GraduationCap },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'timetable', label: 'Planner', icon: Calendar },
    { id: 'syllabus', label: 'Syllabus', icon: BookOpen },
    { id: 'mock-tests', label: 'Mock CBT', icon: CheckSquare },
    { id: 'notifications', label: 'Alerts', icon: Bell, badge: unreadNotificationsCount },
    { id: 'progress', label: 'Analytics', icon: FileSpreadsheet },
    { id: 'resources', label: 'Resources', icon: BookMarked },
    { id: 'about', label: 'About GATE', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-lg font-bold bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 dark:from-blue-400 dark:via-indigo-300 dark:to-purple-400 bg-clip-text text-transparent">
                  GATE Prep Planner
                </span>
                <span className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                  AIR Rank Accelerator
                </span>
              </div>
            </button>

            {/* Branch Selector Pill */}
            <div className="relative hidden md:block ml-3">
              <button
                onClick={() => setBranchDropdownOpen(!branchDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Paper: {currentBranchInfo.shortName}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {branchDropdownOpen && (
                <div className="absolute left-0 mt-2 w-64 rounded-xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 p-1.5 z-50">
                  <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Select GATE Paper
                  </div>
                  <div className="space-y-0.5 max-h-72 overflow-y-auto">
                    {BRANCHES_INFO.map(branch => (
                      <button
                        key={branch.code}
                        onClick={() => {
                          setSelectedBranch(branch.code);
                          setBranchDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition ${
                          selectedBranch === branch.code
                            ? 'bg-indigo-600 text-white font-semibold'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        <div className="truncate">
                          <span className="font-bold mr-1.5">[{branch.code}]</span>
                          <span>{branch.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-2">
            {/* GATE AI Assistant Button */}
            <button
              onClick={toggleChatbot}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition shadow-sm ${
                isChatbotOpen
                  ? 'bg-indigo-600 text-white shadow-indigo-500/20'
                  : 'bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/50'
              }`}
              title="Open GATE AI Study Assistant (n8n Agent)"
            >
              <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline font-semibold">AI Mentor</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </button>

            {/* GATE Virtual Calculator Button */}
            <button
              onClick={() => setIsCalculatorOpen(!isCalculatorOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition shadow-sm"
              title="Launch GATE Scientific Virtual Calculator"
            >
              <Calculator className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="hidden sm:inline font-semibold">Calculator</span>
            </button>

            {/* Dark/Light mode toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Admin Quick Link */}
            <button
              onClick={() => setActiveTab('admin')}
              className={`p-2 rounded-lg transition ${
                activeTab === 'admin'
                  ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Admin Portal (Manage Syllabus & Notifications)"
            >
              <ShieldAlert className="w-4 h-4" />
            </button>

            {/* Profile Avatar or Demo Login */}
            {user ? (
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border transition ${
                  activeTab === 'profile'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden lg:block text-left text-xs">
                  <div className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[80px]">
                    {user.name.split(' ')[0]}
                  </div>
                  <div className="text-[10px] text-slate-400">GATE {user.targetYear}</div>
                </div>
              </button>
            ) : (
              <button
                onClick={loginDemoUser}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm"
              >
                Sign In
              </button>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 pt-2 pb-6 space-y-3">
          {/* Branch Picker in mobile */}
          <div className="pt-2 pb-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Select GATE Paper:
            </label>
            <select
              value={selectedBranch}
              onChange={e => setSelectedBranch(e.target.value as any)}
              className="w-full text-xs font-semibold py-2 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              {BRANCHES_INFO.map(b => (
                <option key={b.code} value={b.code}>
                  [{b.code}] {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-auto px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
            <button
              onClick={() => {
                setIsChatbotOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-sm"
            >
              <Bot className="w-4 h-4" />
              <span>Ask GATE AI Assistant</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
            </button>

            <button
              onClick={() => {
                setActiveTab('profile');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold"
            >
              <User className="w-4 h-4" />
              <span>User Profile & Settings</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('admin');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-medium"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
