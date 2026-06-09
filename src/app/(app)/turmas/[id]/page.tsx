"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Upload, UserPlus, Download, X, Trash2 } from "lucide-react";
import type { Classroom, Student } from "@/types";

export default function DetalheTurmaPage() {
  const params = useParams();
  const id = params.id as string;

  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [newStudentBirth, setNewStudentBirth] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/classrooms/${id}`);
      if (res.ok) {
        const data = await res.json();
        setClassroom(data);
        setStudents(data.students || []);
      }
    } catch (err) {
      console.error("Erro ao carregar turma:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/classrooms/${id}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: newStudentName,
          email: newStudentEmail || undefined,
          birthDate: newStudentBirth || undefined,
        }),
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewStudentName("");
        setNewStudentEmail("");
        setNewStudentBirth("");
        fetchData();
      }
    } catch (err) {
      console.error("Erro ao adicionar aluno:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm("Tem certeza que deseja remover este aluno?")) return;
    try {
      await fetch(`/api/classrooms/${id}/students/${studentId}`, {
        method: "DELETE",
      });
      fetchData();
    } catch (err) {
      console.error("Erro ao excluir aluno:", err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center py-20">
        <div className="text-muted-foreground text-sm">Carregando...</div>
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center py-20">
        <div className="text-muted-foreground text-sm">Turma não encontrada</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/turmas">
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{classroom.name}</h1>
            <p className="text-muted-foreground text-sm">
              {classroom.subject} · {classroom.year} · {students.length} alunos
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a href="#" download id="btn-download-template">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="w-3.5 h-3.5" />
              Template CSV
            </Button>
          </a>
          <Button variant="outline" size="sm" className="gap-1.5" id="btn-import-csv">
            <Upload className="w-3.5 h-3.5" />
            Importar CSV
          </Button>
          <Button size="sm" className="gap-1.5" id="btn-add-student" onClick={() => setShowAddModal(true)}>
            <UserPlus className="w-3.5 h-3.5" />
            Adicionar Aluno
          </Button>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Alunos", value: students.length },
          { label: "Provas aplicadas", value: classroom.assessmentCount },
          { label: "Ano letivo", value: classroom.year },
        ].map(({ label, value }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold mb-1">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      {/* Student table */}
      <div className="bg-card border border-border rounded-xl">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-sm">Lista de Alunos</h2>
          <span className="text-xs text-muted-foreground">{students.length} alunos</span>
        </div>
        {students.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            Nenhum aluno cadastrado ainda.{" "}
            <button onClick={() => setShowAddModal(true)} className="text-primary hover:underline">
              Adicionar o primeiro aluno
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">#</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nome</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">E-mail</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nascimento</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {students.map((s, i) => (
                <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3 text-sm text-muted-foreground">{i + 1}</td>
                  <td className="px-5 py-3 text-sm font-medium">{s.fullName}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{s.email}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{s.birthDate}</td>
                  <td className="px-5 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteStudent(s.id)}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Remover
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Adicionar Aluno */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Adicionar Aluno</h2>
              <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">Nome completo *</label>
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Ex: Ana Clara Souza"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">E-mail</label>
                <input
                  type="email"
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  placeholder="aluno@escola.edu.br"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Data de nascimento</label>
                <input
                  type="date"
                  value={newStudentBirth}
                  onChange={(e) => setNewStudentBirth(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" disabled={saving}>
                  {saving ? "Adicionando..." : "Adicionar"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
