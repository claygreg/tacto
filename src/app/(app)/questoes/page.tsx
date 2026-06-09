"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, SlidersHorizontal, Edit, Trash2, FilePlus, Loader2 } from "lucide-react";
import type { Question, QuestionDifficulty } from "@/types";

const difficultyLabel: Record<string, string> = {
  easy: "Fácil",
  medium: "Médio",
  hard: "Difícil",
};

const difficultyClass: Record<string, string> = {
  easy: "bg-green-500/15 text-green-400 border-green-500/20",
  medium: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  hard: "bg-red-500/15 text-red-400 border-red-500/20",
};

const disciplinesList = ["Todas", "Matemática", "Ciências", "Português", "História"];
const typesList = ["Todos", "Múltipla Escolha", "Discursiva"];
const difficultiesList = ["Todos", "Fácil", "Médio", "Difícil"];

function QuestionCard({ question, onDelete }: { question: Question; onDelete: (id: string) => void }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/40 transition-colors group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {question.discipline && <Badge variant="outline" className="text-xs">{question.discipline}</Badge>}
          {question.yearLevel && <Badge variant="outline" className="text-xs">{question.yearLevel}</Badge>}
          {question.difficulty && (
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${difficultyClass[question.difficulty] || "border-border text-muted-foreground"}`}>
              {difficultyLabel[question.difficulty] || question.difficulty}
            </span>
          )}
          {question.source === "ai_generated" && (
            <Badge variant="outline" className="text-xs border-primary/30 text-primary">IA</Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground shrink-0">
          {question.type === "multiple_choice" ? "Objetiva" : "Discursiva"}
        </span>
      </div>

      {question.baseText && (
        <p className="text-xs text-muted-foreground italic mb-2 line-clamp-1 border-l-2 border-border pl-2">
          {question.baseText}
        </p>
      )}

      <p className="text-sm text-card-foreground leading-relaxed line-clamp-3 mb-3 whitespace-pre-wrap">
        {question.body}
      </p>

      {question.bnccCode && (
        <p className="text-xs text-muted-foreground mb-3">
          BNCC: <span className="font-mono">{question.bnccCode}</span>
        </p>
      )}

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link href={`/questoes/${question.id}`}>
          <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs">
            <Edit className="w-3 h-3" />
            Editar
          </Button>
        </Link>
        <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs">
          <FilePlus className="w-3 h-3" />
          Add à Prova
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 ml-auto"
          onClick={() => onDelete(question.id)}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

export default function QuestoesPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [discipline, setDiscipline] = useState("Todas");
  const [type, setType] = useState("Todos");
  const [difficulty, setDifficulty] = useState("Todos");
  const [search, setSearch] = useState("");

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (discipline !== "Todas") params.append("discipline", discipline);
      if (type !== "Todos") params.append("type", type);
      if (difficulty !== "Todos") params.append("difficulty", difficulty);
      if (search) params.append("search", search);

      const res = await fetch(`/api/questions?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
      }
    } catch (err) {
      console.error("Erro ao buscar questões:", err);
    } finally {
      setLoading(false);
    }
  }, [discipline, type, difficulty, search]);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchQuestions();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchQuestions]);

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta questão?")) return;
    try {
      const res = await fetch(`/api/questions/${id}`, { method: "DELETE" });
      if (res.ok) {
        setQuestions(questions.filter((q) => q.id !== id));
      }
    } catch (err) {
      console.error("Erro ao excluir questão", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Banco de Questões</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {questions.length} questão(ões) no seu banco pessoal
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/questoes/acervo">
            <Button variant="outline" className="gap-2">
              <Search className="w-4 h-4" />
              Acervo Público
            </Button>
          </Link>
          <Link href="/questoes/novo">
            <Button className="gap-2" id="btn-new-question">
              <Plus className="w-4 h-4" />
              Nova Questão
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar filtros */}
        <aside className="w-full md:w-52 shrink-0 space-y-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filtros
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium mb-2">Disciplina</p>
                <div className="space-y-1">
                  {disciplinesList.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDiscipline(d)}
                      className={`w-full text-left text-sm px-2.5 py-1.5 rounded-lg transition-colors ${
                        discipline === d
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium mb-2">Tipo</p>
                <div className="space-y-1">
                  {typesList.map((t) => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={`w-full text-left text-sm px-2.5 py-1.5 rounded-lg transition-colors ${
                        type === t
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium mb-2">Dificuldade</p>
                <div className="space-y-1">
                  {difficultiesList.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`w-full text-left text-sm px-2.5 py-1.5 rounded-lg transition-colors ${
                        difficulty === d
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Grid de questões */}
        <div className="flex-1 min-w-0">
          {/* Busca */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              id="input-search-questions"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por enunciado, tag ou BNCC..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-border rounded-xl bg-card/30">
              <p className="text-muted-foreground text-sm mb-4">Nenhuma questão encontrada com estes filtros.</p>
              <Link href="/questoes/novo">
                <Button variant="outline" size="sm">Criar Primeira Questão</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-3">
              {questions.map((q) => (
                <QuestionCard key={q.id} question={q} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
