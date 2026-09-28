import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  BranchCode,
  BranchSyllabus,
  ExamNotification,
  StudyPlanConfig,
  StudySessionLog,
  TestResult,
  TimetableTask,
  UserProfile,
} from '../types';
import { INITIAL_SYLLABUS_MAP } from '../data/branchesData';
import { INITIAL_NOTIFICATIONS } from '../data/notificationsData';
import { generatePersonalizedTimetable, rebalanceMissedTasks } from '../utils/timetableGenerator';
import confetti from 'canvas-confetti';

interface AppContextType {
  user: UserProfile | null;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  selectedBranch: BranchCode;
  setSelectedBranch: (branch: BranchCode) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  syllabusMap: Record<BranchCode, BranchSyllabus>;
  completedSubtopicIds: string[];
  toggleSubtopicComplete: (subtopicId: string) => void;
  timetable: TimetableTask[];
  timetableConfig: StudyPlanConfig;
  generateTimetable: (config: StudyPlanConfig) => void;
  toggleTaskComplete: (taskId: string) => void;
  rebalanceTasks: () => void;
  notifications: ExamNotification[];
  markNotificationRead: (id: string) => void;
  toggleNotificationReminder: (id: string) => void;
  addNotification: (notif: ExamNotification) => void;
  testResults: TestResult[];
  saveTestResult: (result: TestResult) => void;
  bookmarkedQuestionIds: string[];
  toggleBookmarkQuestion: (questionId: string) => void;
  studyLogs: StudySessionLog[];
  logStudySession: (log: Omit<StudySessionLog, 'id'>) => void;
  isCalculatorOpen: boolean;
  setIsCalculatorOpen: (open: boolean) => void;
  isChatbotOpen: boolean;
  setIsChatbotOpen: (open: boolean) => void;
  toggleChatbot: () => void;
  login: (name: string, email: string, branch: BranchCode, targetYear?: number) => void;
  loginDemoUser: () => void;
  logout: () => void;
  updateProfile: (updated: Partial<UserProfile>) => void;
  getSyllabusProgress: (branchCode: BranchCode) => { completed: number; total: number; percentage: number };
  exportBackupData: () => void;
  importBackupData: (jsonStr: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEMO_USER: UserProfile = {
  id: 'user-demo-gate',
  name: 'Arjun Sharma',
  email: 'arjun.gate2027@example.com',
  branch: 'CS',
  targetYear: 2027,
  dailyGoalHours: 4,
  prepLevel: 'Intermediate',
  avatarSeed: 'Arjun',
  createdAt: '2026-08-01',
  emailAlerts: true,
  browserNotifications: true,
};

const DEFAULT_CONFIG: StudyPlanConfig = {
  targetYear: 2027,
  branchCode: 'CS',
  examDate: '2027-02-06',
  dailyHours: 4,
  weekendHours: 6,
  prepLevel: 'Intermediate',
  focusWeakAreas: true,
  includeBufferDays: true,
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('gate_theme') as 'light' | 'dark') || 'light';
  });

  // User auth state
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('gate_user');
    return saved ? JSON.parse(saved) : DEMO_USER;
  });

  const [selectedBranch, setSelectedBranch] = useState<BranchCode>(() => {
    const saved = localStorage.getItem('gate_branch');
    return (saved as BranchCode) || (user?.branch || 'CS');
  });

  const [activeTab, setActiveTab] = useState<string>('home');
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const toggleChatbot = () => setIsChatbotOpen(prev => !prev);

  // Syllabus state
  const [syllabusMap, setSyllabusMap] = useState<Record<BranchCode, BranchSyllabus>>(() => {
    const saved = localStorage.getItem('gate_syllabus_map');
    return saved ? JSON.parse(saved) : INITIAL_SYLLABUS_MAP;
  });

  const [completedSubtopicIds, setCompletedSubtopicIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('gate_completed_subtopics');
    return saved ? JSON.parse(saved) : ['ga-1', 'cs-ds-1', 'cs-em-1']; // Seeded demo progress
  });

  // Timetable
  const [timetableConfig, setTimetableConfig] = useState<StudyPlanConfig>(() => {
    const saved = localStorage.getItem('gate_timetable_config');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });

  const [timetable, setTimetable] = useState<TimetableTask[]>(() => {
    const saved = localStorage.getItem('gate_timetable');
    if (saved) {
      return JSON.parse(saved);
    }
    return generatePersonalizedTimetable(DEFAULT_CONFIG);
  });

  // Notifications
  const [notifications, setNotifications] = useState<ExamNotification[]>(() => {
    const saved = localStorage.getItem('gate_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Mock Test results
  const [testResults, setTestResults] = useState<TestResult[]>(() => {
    const saved = localStorage.getItem('gate_test_results');
    return saved ? JSON.parse(saved) : [];
  });

  // Bookmarks
  const [bookmarkedQuestionIds, setBookmarkedQuestionIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('gate_bookmarks');
    return saved ? JSON.parse(saved) : ['q-cs-2'];
  });

  // Study logs
  const [studyLogs, setStudyLogs] = useState<StudySessionLog[]>(() => {
    const saved = localStorage.getItem('gate_study_logs');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'log-1',
            date: '2026-09-26',
            subject: 'Data Structures',
            topic: 'Binary Search Trees & AVL Traversals',
            durationMinutes: 120,
            tasksCompleted: 2,
            notes: 'Solved 10 previous year questions with good accuracy.',
          },
          {
            id: 'log-2',
            date: '2026-09-27',
            subject: 'General Aptitude',
            topic: 'Work and Time + Quantitative Reasoning',
            durationMinutes: 90,
            tasksCompleted: 1,
            notes: 'Formula notes updated for pipes and cisterns.',
          },
        ];
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('gate_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('gate_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('gate_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('gate_branch', selectedBranch);
  }, [selectedBranch]);

  useEffect(() => {
    localStorage.setItem('gate_completed_subtopics', JSON.stringify(completedSubtopicIds));
  }, [completedSubtopicIds]);

  useEffect(() => {
    localStorage.setItem('gate_timetable', JSON.stringify(timetable));
  }, [timetable]);

  useEffect(() => {
    localStorage.setItem('gate_timetable_config', JSON.stringify(timetableConfig));
  }, [timetableConfig]);

  useEffect(() => {
    localStorage.setItem('gate_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('gate_test_results', JSON.stringify(testResults));
  }, [testResults]);

  useEffect(() => {
    localStorage.setItem('gate_bookmarks', JSON.stringify(bookmarkedQuestionIds));
  }, [bookmarkedQuestionIds]);

  useEffect(() => {
    localStorage.setItem('gate_study_logs', JSON.stringify(studyLogs));
  }, [studyLogs]);

  useEffect(() => {
    localStorage.setItem('gate_syllabus_map', JSON.stringify(syllabusMap));
  }, [syllabusMap]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const toggleSubtopicComplete = (subtopicId: string) => {
    setCompletedSubtopicIds(prev => {
      const exists = prev.includes(subtopicId);
      const next = exists ? prev.filter(id => id !== subtopicId) : [...prev, subtopicId];
      if (!exists) {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
        });
      }
      return next;
    });
  };

  const generateTimetable = (config: StudyPlanConfig) => {
    setTimetableConfig(config);
    const newTasks = generatePersonalizedTimetable(config);
    setTimetable(newTasks);
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const toggleTaskComplete = (taskId: string) => {
    setTimetable(prev =>
      prev.map(task => {
        if (task.id === taskId) {
          const nextState = !task.completed;
          if (nextState) {
            confetti({
              particleCount: 30,
              spread: 50,
              origin: { y: 0.8 },
            });
          }
          return { ...task, completed: nextState };
        }
        return task;
      })
    );
  };

  const rebalanceTasks = () => {
    const updated = rebalanceMissedTasks(timetable);
    setTimetable(updated);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const toggleNotificationReminder = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, reminderSet: !n.reminderSet } : n))
    );
  };

  const addNotification = (notif: ExamNotification) => {
    setNotifications(prev => [notif, ...prev]);
  };

  const saveTestResult = (result: TestResult) => {
    setTestResults(prev => [result, ...prev]);
    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.5 },
    });
  };

  const toggleBookmarkQuestion = (questionId: string) => {
    setBookmarkedQuestionIds(prev =>
      prev.includes(questionId) ? prev.filter(id => id !== questionId) : [...prev, questionId]
    );
  };

  const logStudySession = (logData: Omit<StudySessionLog, 'id'>) => {
    const newLog: StudySessionLog = {
      ...logData,
      id: `log-${Date.now()}`,
    };
    setStudyLogs(prev => [newLog, ...prev]);
  };

  const login = (name: string, email: string, branch: BranchCode, targetYear = 2027) => {
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name,
      email,
      branch,
      targetYear,
      dailyGoalHours: 4,
      prepLevel: 'Intermediate',
      avatarSeed: name,
      createdAt: new Date().toISOString().slice(0, 10),
      emailAlerts: true,
      browserNotifications: true,
    };
    setUser(newUser);
    setSelectedBranch(branch);
  };

  const loginDemoUser = () => {
    setUser(DEMO_USER);
    setSelectedBranch(DEMO_USER.branch);
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    if (!user) return;
    const nextUser = { ...user, ...updated };
    setUser(nextUser);
    if (updated.branch) {
      setSelectedBranch(updated.branch);
    }
  };

  const getSyllabusProgress = (branchCode: BranchCode) => {
    const branchSyllabus = syllabusMap[branchCode] || syllabusMap.CS;
    let total = 0;
    let completed = 0;

    branchSyllabus.subjects.forEach(subj => {
      subj.subtopics.forEach(sub => {
        total++;
        if (completedSubtopicIds.includes(sub.id)) {
          completed++;
        }
      });
    });

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  };

  const exportBackupData = () => {
    const payload = {
      user,
      selectedBranch,
      completedSubtopicIds,
      timetable,
      timetableConfig,
      testResults,
      bookmarkedQuestionIds,
      studyLogs,
      notifications,
      exportedAt: new Date().toISOString(),
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `GATE_Prep_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importBackupData = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.user) setUser(data.user);
      if (data.selectedBranch) setSelectedBranch(data.selectedBranch);
      if (data.completedSubtopicIds) setCompletedSubtopicIds(data.completedSubtopicIds);
      if (data.timetable) setTimetable(data.timetable);
      if (data.timetableConfig) setTimetableConfig(data.timetableConfig);
      if (data.testResults) setTestResults(data.testResults);
      if (data.bookmarkedQuestionIds) setBookmarkedQuestionIds(data.bookmarkedQuestionIds);
      if (data.studyLogs) setStudyLogs(data.studyLogs);
      return true;
    } catch (e) {
      console.error('Failed to import backup data:', e);
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        theme,
        toggleTheme,
        selectedBranch,
        setSelectedBranch,
        activeTab,
        setActiveTab,
        syllabusMap,
        completedSubtopicIds,
        toggleSubtopicComplete,
        timetable,
        timetableConfig,
        generateTimetable,
        toggleTaskComplete,
        rebalanceTasks,
        notifications,
        markNotificationRead,
        toggleNotificationReminder,
        addNotification,
        testResults,
        saveTestResult,
        bookmarkedQuestionIds,
        toggleBookmarkQuestion,
        studyLogs,
        logStudySession,
        isCalculatorOpen,
        setIsCalculatorOpen,
        isChatbotOpen,
        setIsChatbotOpen,
        toggleChatbot,
        login,
        loginDemoUser,
        logout,
        updateProfile,
        getSyllabusProgress,
        exportBackupData,
        importBackupData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
