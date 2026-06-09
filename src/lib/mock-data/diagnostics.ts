// TODO: [API] GET /api/diagnostics/:assessmentId
import type { DiagnosticSummary, StudentResult } from "@/types";

export const mockDiagnosticSummary: DiagnosticSummary = {
  assessmentId: "asmnt-1",
  assessmentName: "Avaliação Bimestral — 2º Bimestre",
  classroomName: "9º Ano A",
  appliedAt: "2026-04-22",
  totalStudents: 10,
  average: 7.2,
  highest: 9.5,
  lowest: 3.0,
  median: 7.5,
  questionStats: [
    { questionId: "q-1", label: "Q1", correctRate: 0.85, topic: "Potenciação" },
    { questionId: "q-2", label: "Q2", correctRate: 0.62, topic: "Pitágoras" },
    { questionId: "q-3", label: "Q3", correctRate: 0.45, topic: "Divisão Celular" },
    { questionId: "q-4", label: "Q4", correctRate: 0.78, topic: "Figuras de Ling." },
    { questionId: "q-5", label: "Q5", correctRate: 0.30, topic: "Fotossíntese" },
    { questionId: "q-6", label: "Q6", correctRate: 0.90, topic: "Equações" },
    { questionId: "q-7", label: "Q7", correctRate: 0.55, topic: "Geometria" },
    { questionId: "q-8", label: "Q8", correctRate: 0.70, topic: "Estatística" },
  ],
  skillStats: [
    { skill: "Álgebra", rate: 0.71 },
    { skill: "Geometria", rate: 0.58 },
    { skill: "Estatística", rate: 0.70 },
    { skill: "Números", rate: 0.85 },
  ],
  gradeDistribution: [
    { range: "0–4", count: 2 },
    { range: "4–6", count: 2 },
    { range: "6–8", count: 3 },
    { range: "8–10", count: 3 },
  ],
};

export const mockStudentResults: StudentResult[] = [
  { studentId: "stu-1", studentName: "Ana Clara Souza", score: 9.5, rank: 1, correctCount: 8, totalCount: 8 },
  { studentId: "stu-2", studentName: "Bruno Ferreira Lima", score: 8.0, rank: 2, correctCount: 7, totalCount: 8 },
  { studentId: "stu-3", studentName: "Camila Rodrigues", score: 7.5, rank: 3, correctCount: 6, totalCount: 8 },
  { studentId: "stu-4", studentName: "Daniel Oliveira Costa", score: 7.5, rank: 3, correctCount: 6, totalCount: 8 },
  { studentId: "stu-5", studentName: "Eduarda Martins", score: 7.0, rank: 5, correctCount: 6, totalCount: 8 },
  { studentId: "stu-6", studentName: "Felipe Santos Rocha", score: 6.5, rank: 6, correctCount: 5, totalCount: 8 },
  { studentId: "stu-7", studentName: "Gabriela Nunes", score: 6.0, rank: 7, correctCount: 5, totalCount: 8 },
  { studentId: "stu-8", studentName: "Hugo Pereira Alves", score: 5.5, rank: 8, correctCount: 4, totalCount: 8 },
  { studentId: "stu-9", studentName: "Isabela Torres", score: 4.5, rank: 9, correctCount: 4, totalCount: 8 },
  { studentId: "stu-10", studentName: "João Vitor Carvalho", score: 3.0, rank: 10, correctCount: 2, totalCount: 8 },
];

export const mockHistoricalData = [
  { period: "1º Bim", average: 6.1, highest: 8.5, lowest: 2.5 },
  { period: "2º Bim", average: 7.2, highest: 9.5, lowest: 3.0 },
  { period: "3º Bim", average: 6.8, highest: 9.0, lowest: 3.5 },
  { period: "4º Bim", average: 7.9, highest: 10.0, lowest: 4.0 },
];
