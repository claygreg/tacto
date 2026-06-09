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
  options: QuestionOption[];
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
  email: string;
  birthDate: string;
  classroomId: string;
}

export interface Assessment {
  id: string;
  name: string;
  classroomId: string;
  classroomName: string;
  status: AssessmentStatus;
  createdAt: string;
  appliedAt: string | null;
  questionCount: number;
  totalPoints: number;
  versions: number;
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
