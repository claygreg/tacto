"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Users, FileText, Archive, X } from "lucide-react";
import type { Classroom } from "@/types";

export default function TurmasPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newYear, setNewYear] = useState(new Date().getFullYear().toString());
  const [saving, setSaving] = useState(false);

  const fetchClassrooms = useCallback(async () => {
    try {
      const res = await fetch("/api/classrooms");
      if (res.ok) {
        const data = await res.json();
        setClassrooms(data);
      }
    } catch (err) {
      console.error("Erro ao carregar turmas:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClassrooms();
  }, [fetchClassrooms]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/classrooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, year: parseInt(newYear), subject: newSubject }),
      });
      if (res.ok) {
        setShowModal(false);
        setNewName("");
        setNewSubject("");
        setNewYear(new Date().getFullYear().toString());
        fetchClassrooms();
      }
    } catch (err) {
      console.error("Erro ao criar turma:", err);
    } finally {
      setSaving(false);
    }
  };

  const active = classrooms.filter((c) => !c.archived);
  const archived = classrooms.filter((c) => c.archived);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center py-20">
        <div className="text-muted-foreground text-sm">Carregando turmas...</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Turmas</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {active.length} turma{active.length !== 1 ? "s" : ""} ativa{active.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button className="gap-2" id="btn-new-classroom" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" />
          Nova Turma
        </Button>
      </div>

      {/* Grid de turmas ativas */}
      <div className="grid grid-cols-3 gap-4">
        {active.map((c) => (
          <Link key={c.id} href={`/turmas/${c.id}`}>
            <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/40 transition-colors group cursor-pointer h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground">{c.year}</span>
              </div>
              <h2 className="font-semibold text-base mb-0.5">{c.name}</h2>
              <p className="text-xs text-muted-foreground mb-4">{c.subject}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {c.studentCount} alunos
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {c.assessmentCount} provas
                </span>
              </div>
            </div>
          </Link>
        ))}

        {/* Card "Nova Turma" */}
        <button
          onClick={() => setShowModal(true)}
          className="bg-card/50 border border-dashed border-border rounded-xl p-5 hover:border-primary/60 hover:bg-card transition-colors text-muted-foreground hover:text-foreground flex flex-col items-center justify-center gap-2 min-h-[140px]"
        >
          <Plus className="w-6 h-6" />
          <span className="text-sm font-medium">Nova Turma</span>
        </button>
      </div>

      {/* Arquivadas */}
      {archived.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Archive className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-muted-foreground">
              Arquivadas ({archived.length})
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {archived.map((c) => (
              <div key={c.id} className="bg-card/50 border border-dashed border-border rounded-xl p-4 opacity-60">
                <h3 className="font-medium text-sm">{c.name}</h3>
                <p className="text-xs text-muted-foreground">{c.subject} · {c.year}</p>
                <p className="text-xs text-muted-foreground mt-1">{c.studentCount} alunos</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Nova Turma */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Nova Turma</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">Nome da turma *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: 9º Ano A"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Disciplina</label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Ex: Matemática"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Ano letivo</label>
                <input
                  type="number"
                  value={newYear}
                  onChange={(e) => setNewYear(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" disabled={saving}>
                  {saving ? "Criando..." : "Criar Turma"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
