export type BranchCode = 'CS' | 'EC' | 'EE' | 'ME' | 'CE' | 'CH' | 'BT' | 'DA';

export interface BranchInfo {
  code: BranchCode;
  name: string;
  shortName: string;
  icon: string;
  description: string;
  papersIncluded: string[];
}

export interface SyllabusSubtopic {
  id: string;
  title: string;
  completed: boolean;
  notes?: string;
  formulas?: string[];
  pyqCount?: number;
  pyqLinks?: { year: number; questionNo: string; text: string }[];
}

export interface SyllabusSubject {
  id: string;
  name: string;
  category: 'General Aptitude' | 'Engineering Mathematics' | 'Core Engineering';
  weightagePercentage: number;
  estimatedHours: number;
  subtopics: SyllabusSubtopic[];
  shortNotes?: string;
  importantFormulas?: string[];
}

export interface BranchSyllabus {
  branchCode: BranchCode;
  branchName: string;
  lastUpdated: string;
  officialSource: string;
  subjects: SyllabusSubject[];
}

export type PrepLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface TimetableTask {
  id: string;
  date: string; // YYYY-MM-DD
  dayOfWeek: string;
  subjectId: string;
  subjectName: string;
  topicId: string;
  topicName: string;
  type: 'Theory & Concept' | 'Practice PYQ' | 'Revision & Notes' | 'Mock Test' | 'Doubt Solving';
  durationHours: number;
  completed: boolean;
  notes?: string;
  isMissed?: boolean;
}

export interface StudyPlanConfig {
  targetYear: number;
  branchCode: BranchCode;
  examDate: string; // YYYY-MM-DD
  dailyHours: number;
  weekendHours: number;
  prepLevel: PrepLevel;
  focusWeakAreas: boolean;
  preferredSubjectsFirst?: string[];
  includeBufferDays: boolean;
}

export interface ExamNotification {
  id: string;
  title: string;
  category: 'Registration' | 'Admit Card' | 'Exam Date' | 'Answer Key' | 'Result' | 'Counseling' | 'Rule Change';
  date: string;
  deadline?: string;
  status: 'Upcoming' | 'Active' | 'Closed';
  isOfficial: boolean;
  officialSource: string;
  officialUrl: string;
  summary: string;
  actionRequired?: string;
  read?: boolean;
  reminderSet?: boolean;
  important?: boolean;
}

export type QuestionType = 'MCQ' | 'MSQ' | 'NAT';

export interface Question {
  id: string;
  paperCode: BranchCode;
  subject: string;
  topic: string;
  type: QuestionType;
  marks: 1 | 2;
  negativeMarks: number; // 0.33 for 1 mark MCQ, 0.66 for 2 mark MCQ, 0 for MSQ/NAT
  questionText: string;
  questionImage?: string;
  options?: { key: string; text: string }[]; // For MCQ & MSQ
  correctAnswer: string | string[] | number | [number, number]; // string for MCQ, array for MSQ, number or range [min, max] for NAT
  solutionExplanation: string;
  year?: number; // If PYQ
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface MockTest {
  id: string;
  title: string;
  branchCode: BranchCode;
  durationMinutes: number;
  totalMarks: number;
  questionsCount: number;
  difficulty: 'Standard GATE Level' | 'Topic Test' | 'Full Length Mock';
  description: string;
  questions: Question[];
}

export interface TestResponse {
  questionId: string;
  selectedOption?: string; // For MCQ
  selectedOptions?: string[]; // For MSQ
  natAnswer?: string; // For NAT
  status: 'not_visited' | 'not_answered' | 'answered' | 'marked_for_review' | 'answered_marked_for_review';
  isCorrect?: boolean;
  marksAwarded?: number;
  timeSpentSeconds: number;
}

export interface TestResult {
  id: string;
  testId: string;
  testTitle: string;
  branchCode: BranchCode;
  submittedAt: string;
  score: number;
  totalMarks: number;
  accuracy: number;
  totalTimeSeconds: number;
  questionsAttempted: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unattempted: number;
  topicAnalysis: { topic: string; correct: number; total: number; score: number }[];
  responses: Record<string, TestResponse>;
}

export interface StudySessionLog {
  id: string;
  date: string; // YYYY-MM-DD
  subject: string;
  topic: string;
  durationMinutes: number;
  tasksCompleted: number;
  notes?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  branch: BranchCode;
  targetYear: number;
  dailyGoalHours: number;
  prepLevel: PrepLevel;
  avatarSeed: string;
  createdAt: string;
  emailAlerts: boolean;
  browserNotifications: boolean;
}

export interface StudyResource {
  id: string;
  title: string;
  category: 'Formula Sheet' | 'Reference Books' | 'PYQ Archive' | 'Virtual Calculator Guide' | 'Topper Strategies';
  branchCode?: BranchCode | 'ALL';
  description: string;
  fileSize?: string;
  downloadUrl?: string;
  externalLink?: string;
  content?: string;
}
