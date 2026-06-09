"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Calendar, Users, ExternalLink, Loader2, X } from "lucide-react";

type AssessmentStatus = "draft" | "exported" | "applied";

const statusMap: Record<AssessmentStatus, { label: string; className: string }> = {
  draft: { label: "Rascunho", className: "bg-muted text-muted-foreground border-border" },
  exported: { label: "Montada", className: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
  applied: { label: "Aplicada", className: "bg-green-500/15 text-green-400 border-green-500/20" },
};

export default function ProvasPage() {
  const router = useRouter();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Todas");
  
  // Modal de criação
  const [showModal, setShowModal] = useState(false);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [newName, setNewName] = useState("");
  const [newClassroomId, setNewClassroomId] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [resAssessments, resClassrooms] = await Promise.all([
        fetch("/api/assessments"),
        fetch("/api/classrooms"),
      ]);

      if (resAssessments.ok && resClassrooms.ok) {
        setAssessments(await resAssessments.json());
        const classes = await resClassrooms.json();
        setClassrooms(classes);
        if (classes.length > 0) {
          setNewClassroomId(classes[0].id);
        }
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    setCreating(true);

    if (!newName || !newClassroomId) {
      setCreateError("Preencha todos os campos.");
      setCreating(false);
      return;
    }

    try {
      const res = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, classroomId: newClassroomId }),
      });

      if (!res.ok) throw new Error("Erro ao criar avaliação.");

      const data = await res.json();
      router.push(`/provas/${data.id}`);
    } catch (err: any) {
      setCreateError(err.message);
      setCreating(false);
    }
  };

  const filtered = assessments.filter((a) => {
    if (filter === "Todas") return true;
    if (filter === "Rascunho") return a.status === "draft";
    if (filter === "Montada") return a.status === "exported";
    if (filter === "Aplicada") return a.status === "applied";
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Avaliações</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {assessments.length} avaliações criadas
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" />
          Nova Avaliação
        </Button>
      </div>

      {/* Filter tabs visual */}
      <div className="flex gap-2">
        {["Todas", "Rascunho", "Montada", "Aplicada"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Assessment list */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-xl bg-card/30">
          <p className="text-muted-foreground text-sm mb-4">Nenhuma avaliação encontrada.</p>
          {assessments.length === 0 && classrooms.length === 0 ? (
            <Link href="/turmas">
              <Button variant="outline" size="sm">Criar primeira Turma antes</Button>
            </Link>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setShowModal(true)}>
              Criar primeira Avaliação
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => {
            const status = statusMap[a.status as AssessmentStatus] || statusMap.draft;
            const createdDate = new Date(a.createdAt).toLocaleDateString("pt-BR");
            const appliedDate = a.appliedAt ? new Date(a.appliedAt).toLocaleDateString("pt-BR") : null;

            return (
              <div
                key={a.id}
                className="bg-card border border-border rounded-xl p-5 hover:border-primary/40 transition-colors group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="font-semibold text-base truncate">{a.name}</h2>
                      <Badge variant="outline" className={`text-xs px-2 py-0.5 font-medium shrink-0 ${status.className}`}>
                        {status.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {a.classroomName}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {a.questionCount} questões · {a.totalPoints} pts
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Criada em {createdDate}
                      </span>
                      {appliedDate && (
                        <span className="flex items-center gap-1 text-green-400">
                          <Calendar className="w-3 h-3" />
                          Aplicada em {appliedDate}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    {a.status === "applied" && (
                      <Link href={`/diagnostico/${a.id}`}>
                        <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs">
                          <ExternalLink className="w-3 h-3" />
                          Diagnóstico
                        </Button>
                      </Link>
                    )}
                    {a.status !== "applied" && (
                      <Link href={`/provas/${a.id}/gabarito`}>
                        <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs">
                          Tabular
                        </Button>
                      </Link>
                    )}
                    <Link href={`/provas/${a.id}`}>
                      <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs">
                        Montar Caderno
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Nova Prova */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Nova Avaliação</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {classrooms.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground text-sm mb-4">Você precisa criar uma turma antes de criar uma avaliação.</p>
                <Link href="/turmas">
                  <Button className="w-full">Ir para Turmas</Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleCreate} className="space-y-4">
                {createError && (
                  <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                    {createError}
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium block mb-1.5">Nome da avaliação *</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ex: Prova Bimestral 1"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Turma destino *</label>
                  <select
                    value={newClassroomId}
                    onChange={(e) => setNewClassroomId(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                    required
                  >
                    {classrooms.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.subject || c.year})</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1" disabled={creating}>
                    {creating ? "Criando..." : "Criar Avaliação"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
