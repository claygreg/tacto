// Shared Types Definitions
export interface BaseProps {
  className?: string;
  children?: React.ReactNode;
}

// Types centrais — espelham o schema do backend (Prisma)
// TODO: [API] mover para pacote @tacto/types quando monorepo

export type QuestionType = "multiple_choice" | "discursive";
export type QuestionSource = "personal" | "public" | "ai_generated";
export type QuestionDifficulty = "easy" | "medium" | "hard";
export type AssessmentStatus = "draft" | "exported" | "applied";

export interface QuestionOption {
  id: string;
  label: "A" | "B" | "C" | "D" | "E";
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  type: QuestionType;
  body: string;
  baseText: string | null;
  discipline: string;
  tags: string[];
  bnccCode: string;
  yearLevel: string;
  difficulty: QuestionDifficulty;
  source: QuestionSource;
  imageUrl?: string;
  options: QuestionOption[];
  createdAt?: string;
}

export interface QuestionFolder {
  id: string;
  name: string;
  color: string | null;
  questionCount: number;
  createdAt: string;
}


export interface Classroom {
  id: string;
  name: string;
  year: number;
  subject: string;
  studentCount: number;
  assessmentCount: number;
  archived: boolean;
}

export interface Student {
  id: string;
  fullName: string;
  cpf?: string;
  enrollmentId?: string;
  email?: string;
  birthDate?: string;
  classroomId: string;
  average?: number;
  engagement?: number;
}

export interface Test {
  id: string;
  title: string;
  instructions: string | null;
  status: AssessmentStatus;
  createdAt: string;
  questionCount: number;
}

export interface QuestionStat {
  questionId: string;
  label: string;
  correctRate: number;
  topic: string;
}

export interface SkillStat {
  skill: string;
  rate: number;
}

export interface GradeRange {
  range: string;
  count: number;
  name?: string;  // range label (used by charts)
  value?: number; // count (used by charts)
}

export interface DiagnosticSummary {
  assessmentId: string;
  assessmentName: string;
  classroomName: string;
  appliedAt: string;
  totalStudents: number;
  average: number;
  highest: number;
  lowest: number;
  median: number;
  questionStats: QuestionStat[];
  skillStats: SkillStat[];
  gradeDistribution: GradeRange[];
}

export interface StudentResult {
  studentId: string;
  studentName: string;
  score: number;
  rank: number;
  correctCount: number;
  totalCount: number;
}

export interface HistoricalPoint {
  period: string;
  average: number;
  highest: number;
  lowest: number;
}

// ── Dashboard ────────────────────────────────────────────────

export interface ActivityItem {
  id: string;
  text: string;
  time: string;
}

export interface RecentAssessment {
  id: string;
  name: string;
  classroomName: string;
  questionCount: number;
  status: AssessmentStatus;
}

export interface DashboardSummary {
  classroomCount: number;
  archivedClassrooms: number;
  assessmentCount: number;
  pendingAssessments: number;
  questionCount: number;
  aiGeneratedQuestions: number;
  recentAssessments: RecentAssessment[];
  mockActivity: ActivityItem[];
}

// ── Assessment Detail ────────────────────────────────────────

export interface AssessmentItemDetail {
  id: string;
  order: number;
  weight: number;
  question: Question;
}

export interface AssessmentDetail extends Assessment {
  items: AssessmentItemDetail[];
}

// ── Diagnostics Chart ────────────────────────────────────────

export interface GradeDistributionEntry {
  name: string;
  value: number;
}

// ── Student Diagnostic Detail ────────────────────────────────

export interface DisciplinePerformance {
  name: string;
  correct: number;
  total: number;
  hitRate: number;
}

export interface ItemDetail {
  order: number;
  discipline: string;
  bncc: string | null;
  correctOption: string;
  selectedOption: string | null;
  isCorrect: boolean;
}

export interface StudentDiagnosticDetail {
  studentName: string;
  totalScore: number;
  maxPossibleScore: number;
  performanceByDiscipline: DisciplinePerformance[];
  itemsDetails: ItemDetail[];
}
