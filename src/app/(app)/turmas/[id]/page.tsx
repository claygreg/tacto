"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Upload, UserPlus, Download, X, Trash2, MoreHorizontal, ChevronDown, Edit2 } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import type { Classroom, Student } from "@/types";
import { BreadcrumbSetter } from "@/components/ui/breadcrumb-setter";
import { EditableTitle } from "@/components/ui/editable-title";

export default function DetalheTurmaPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [newStudentBirth, setNewStudentBirth] = useState("");
  const [newStudentCpf, setNewStudentCpf] = useState("");
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editStudentForm, setEditStudentForm] = useState<Partial<Student>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
          cpf: newStudentCpf,
          email: newStudentEmail || undefined,
          birthDate: newStudentBirth || undefined,
        }),
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewStudentName("");
        setNewStudentCpf("");
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

  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    setSaving(true);
    try {
      // Endpoint mock, just to simulate save
      // await fetch(`/api/classrooms/${id}/students/${editingStudent.id}`, { ... })
      setEditingStudent(null);
      fetchData();
    } catch (err) {
      console.error("Erro ao editar aluno:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm("Tem certeza que deseja remover este aluno da turma? Ele não será apagado da base escolar.")) return;
    try {
      await fetch(`/api/classrooms/${id}/students/${studentId}`, {
        method: "DELETE",
      });
      setEditingStudent(null);
      fetchData();
    } catch (err) {
      console.error("Erro ao excluir aluno:", err);
    }
  };

  const handleDeleteClassroom = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/classrooms/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/turmas");
      }
    } catch (err) {
      console.error("Erro ao excluir turma:", err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <div className="text-muted-foreground text-sm">Carregando...</div>
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <div className="text-muted-foreground text-sm">Turma não encontrada</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {classroom?.name && <BreadcrumbSetter segment={id} label={classroom.name} />}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/turmas">
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex-1 max-w-[50vw]">
            <EditableTitle
              value={classroom?.name || ""}
              onValueChange={(val) => setClassroom(prev => prev ? { ...prev, name: val } : prev)}
              placeholder="Nome da Turma"
              textClassName="text-2xl font-bold tracking-tight text-foreground"
              className="-ml-2"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Importar — dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Upload className="w-4 h-4" /> Importar <ChevronDown className="w-3.5 h-3.5 ml-0.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={6}>
              <DropdownMenuItem asChild>
                <a href="#" download id="btn-download-template">
                  <Download className="w-4 h-4 mr-2" /> Baixar modelo
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem id="btn-import-csv">
                <Upload className="w-4 h-4 mr-2" /> Enviar planilha
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Adicionar */}
          <Button className="gap-2" id="btn-add-student" onClick={() => setShowAddModal(true)}>
            <UserPlus className="w-4 h-4" /> Adicionar
          </Button>

          {/* Ellipsis — opções extras */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={6}>
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setShowDeleteModal(true)}>
                <Trash2 className="w-4 h-4 mr-2" /> Apagar turma
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            <Button variant="link" onClick={() => setShowAddModal(true)} className="p-0 h-auto font-normal">
              Adicionar o primeiro aluno
            </Button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-12">#</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nome</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">CPF</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Engajamento</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Média</th>
                <th className="px-5 py-3 w-16" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {students.map((s, i) => {
                const avg = s.average ?? 0;
                const avgColor = avg >= 7 ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : avg >= 5 ? "text-amber-500 bg-amber-500/10 border-amber-500/20" : "text-red-500 bg-red-500/10 border-red-500/20";
                return (
                  <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3 text-sm text-muted-foreground">{i + 1}</td>
                    <td className="px-5 py-3">
                      <div className="font-medium text-sm">{s.fullName}</div>
                      {s.enrollmentId && <div className="text-xs text-muted-foreground">#{s.enrollmentId}</div>}
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{s.cpf || "—"}</td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-sm font-medium">{s.engagement ? `${(s.engagement * 100).toFixed(0)}%` : "—"}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      {s.average ? (
                        <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-bold border ${avgColor}`}>
                          {s.average.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          setEditingStudent(s);
                          setEditStudentForm(s);
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
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
              <Button variant="ghost" size="icon" onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </Button>
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
                <label className="text-sm font-medium block mb-1.5">CPF *</label>
                <input
                  type="text"
                  value={newStudentCpf}
                  onChange={(e) => setNewStudentCpf(e.target.value)}
                  placeholder="000.000.000-00"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">E-mail (opcional)</label>
                <input
                  type="email"
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  placeholder="aluno@escola.edu.br"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Data de nascimento (opcional)</label>
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

      {/* Modal Apagar Turma */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-destructive">Apagar Turma</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowDeleteModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-foreground">
                Tem certeza que deseja apagar a turma <strong>{classroom.name}</strong>?
              </p>
              <p className="text-sm text-muted-foreground">
                Esta ação é irreversível e excluirá todos os alunos vinculados a ela, além de desconectar os resultados de provas lançados para esta turma.
              </p>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowDeleteModal(false)}>
                  Cancelar
                </Button>
                <Button variant="destructive" className="flex-1" onClick={handleDeleteClassroom} disabled={deleting}>
                  {deleting ? "Apagando..." : "Sim, apagar turma"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drawer: Editar Aluno */}
      <Sheet open={!!editingStudent} onOpenChange={(open) => !open && setEditingStudent(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Informações do Aluno</SheetTitle>
            <SheetDescription>Altere os dados de cadastro ou remova o aluno desta turma.</SheetDescription>
          </SheetHeader>
          
          {editingStudent && (
            <form onSubmit={handleEditStudent} className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">Nome completo</label>
                <input
                  type="text"
                  value={editStudentForm.fullName || ""}
                  onChange={(e) => setEditStudentForm(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1.5">CPF</label>
                  <input
                    type="text"
                    value={editStudentForm.cpf || ""}
                    onChange={(e) => setEditStudentForm(prev => ({ ...prev, cpf: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Matrícula</label>
                  <input
                    type="text"
                    value={editStudentForm.enrollmentId || ""}
                    onChange={(e) => setEditStudentForm(prev => ({ ...prev, enrollmentId: e.target.value }))}
                    placeholder="Opcional"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">E-mail</label>
                <input
                  type="email"
                  value={editStudentForm.email || ""}
                  onChange={(e) => setEditStudentForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              
              <div className="pt-6 flex flex-col gap-3">
                <Button type="submit" disabled={saving}>
                  {saving ? "Salvando..." : "Salvar Alterações"}
                </Button>
                
                <div className="border-t border-border mt-4 pt-4">
                  <h4 className="text-sm font-semibold text-destructive mb-2">Zona de Perigo</h4>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                    onClick={() => handleDeleteStudent(editingStudent.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remover Aluno da Turma
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Isso não apagará o aluno do sistema, apenas o desconectará desta turma.
                  </p>
                </div>
              </div>
            </form>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
