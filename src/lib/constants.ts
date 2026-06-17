// ============================================================
// Constantes centralizadas — Tacto
// Evita duplicação de labels, mappings e listas entre páginas.
// ============================================================

import type { AssessmentStatus, QuestionDifficulty, QuestionType, QuestionSource } from "@/types";

// ── Assessment Status ────────────────────────────────────────

export const ASSESSMENT_STATUS_LABEL: Record<AssessmentStatus, string> = {
  draft: "Rascunho",
  exported: "Montada",
  applied: "Aplicada",
};

export const ASSESSMENT_STATUS_CLASS: Record<AssessmentStatus, string> = {
  draft: "bg-muted text-muted-foreground border-border",
  exported: "bg-info/15 text-info border-info/20",
  applied: "bg-success/15 text-success border-success/20",
};

// ── Question Difficulty ──────────────────────────────────────

export const DIFFICULTY_LABEL: Record<QuestionDifficulty, string> = {
  easy: "Fácil",
  medium: "Médio",
  hard: "Difícil",
};

export const DIFFICULTY_CLASS: Record<QuestionDifficulty, string> = {
  easy: "bg-success/15 text-success border-success/20",
  medium: "bg-warning/15 text-warning border-warning/20",
  hard: "bg-destructive/15 text-destructive border-destructive/20",
};

// ── Question Type ────────────────────────────────────────────

export const QUESTION_TYPE_LABEL: Record<QuestionType, string> = {
  multiple_choice: "Objetiva",
  discursive: "Discursiva",
};

export const QUESTION_TYPE_SHORT: Record<QuestionType, string> = {
  multiple_choice: "Obj",
  discursive: "Disc",
};

// ── Question Source ──────────────────────────────────────────

export const QUESTION_SOURCE_LABEL: Record<QuestionSource, string> = {
  personal: "Pessoal",
  public: "Acervo",
  ai_generated: "IA",
};

// ── Filter Lists ─────────────────────────────────────────────
// Usadas nas sidebars de filtro. "Todas/Todos" como valor sentinela.

export const DISCIPLINES_LIST = [
  "Todas",
  "Matemática",
  "Ciências",
  "Português",
  "História",
] as const;

export const QUESTION_TYPES_FILTER = [
  "Todos",
  "Múltipla Escolha",
  "Discursiva",
] as const;

export const DIFFICULTIES_FILTER = [
  "Todos",
  "Fácil",
  "Médio",
  "Difícil",
] as const;

// ── Chart Colors ─────────────────────────────────────────────
// Usadas em Recharts (diagnostico). Cores semânticas via CSS vars quando possível,
// hex como fallback para libs que não suportam oklch.

export const CHART_COLORS = {
  primary: "var(--primary)",
  success: "var(--success)",
  warning: "var(--warning)",
  destructive: "var(--destructive)",
  info: "var(--info)",
} as const;

export const PIE_CHART_PALETTE = [
  "var(--destructive)",
  "var(--warning)",
  "var(--info)",
  "var(--success)",
] as const;

// ── Grade Thresholds ─────────────────────────────────────────

export function getGradeColorClass(score: number): string {
  if (score >= 7) return "text-success";
  if (score >= 5) return "text-warning";
  return "text-destructive";
}

export function getPercentColorClass(pct: number): string {
  if (pct >= 70) return "bg-success";
  if (pct >= 50) return "bg-warning";
  return "bg-destructive";
}
