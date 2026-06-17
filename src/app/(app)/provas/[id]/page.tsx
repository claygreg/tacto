"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, GripVertical, Plus, Loader2, Trash2, Printer, CheckCircle, ChevronDown, FileText, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { QuestionBankModal } from "@/components/features/QuestionBankModal";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { QuestionForm } from "@/components/features/QuestionForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { BreadcrumbSetter } from "@/components/ui/breadcrumb-setter";
import { EditableTitle } from "@/components/ui/editable-title";

export default function ProvaEditorPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.id as string;
  const titleInputRef = React.useRef<HTMLInputElement>(null);

  const [test, setTest] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = React.useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = React.useState(false);
  const [classrooms, setClassrooms] = React.useState<any[]>([]);
  const [loadingClassrooms, setLoadingClassrooms] = React.useState(false);

  // Local state for edits
  const [title, setTitle] = React.useState("");
  const [instructions, setInstructions] = React.useState("");

  // Track original values to detect changes
  const [originalTitle, setOriginalTitle] = React.useState("");
  const [originalInstructions, setOriginalInstructions] = React.useState("");
  const [pendingAddedQuestionIds, setPendingAddedQuestionIds] = React.useState<string[]>([]);
  const [pendingRemovedQuestionIds, setPendingRemovedQuestionIds] = React.useState<string[]>([]);

  const hasChanges =
    title !== originalTitle ||
    instructions !== originalInstructions ||
    pendingAddedQuestionIds.length > 0 ||
    pendingRemovedQuestionIds.length > 0;

  React.useEffect(() => {
    fetchTest();
  }, [testId]);

  const fetchTest = async () => {
    try {
      const res = await fetch(`/api/tests/${testId}`);
      if (res.ok) {
        const data = await res.json();
        setTest(data);
        setTitle(data.title);
        setInstructions(data.instructions || "");
        setOriginalTitle(data.title);
        setOriginalInstructions(data.instructions || "");
        setPendingAddedQuestionIds([]);
        setPendingRemovedQuestionIds([]);
      } else {
        router.push("/provas");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      // 1. Save title & instructions
      if (title !== originalTitle || instructions !== originalInstructions) {
        await fetch(`/api/tests/${testId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, instructions })
        });
      }

      // 2. Add pending questions
      if (pendingAddedQuestionIds.length > 0) {
        await fetch(`/api/tests/${testId}/questions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionIds: pendingAddedQuestionIds })
        });
      }

      // 3. Remove pending questions
      for (const tqId of pendingRemovedQuestionIds) {
        await fetch(`/api/tests/${testId}/questions/${tqId}`, {
          method: "DELETE"
        });
      }

      // Re-fetch to sync state
      await fetchTest();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddQuestions = async (questionIds: string[]) => {
    // Add to pending list (optimistic local update)
    setPendingAddedQuestionIds(prev => [...prev, ...questionIds]);
    // Also fetch the question data to display them immediately
    try {
      await fetch(`/api/tests/${testId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionIds })
      });
      await fetchTest();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateQuestionSuccess = async (questionId: string) => {
    setIsCreateModalOpen(false);
    await handleAddQuestions([questionId]);
  };

  const removeQuestion = async (testQuestionId: string) => {
    if (!confirm("Remover esta questão da prova?")) return;
    // Mark as pending removal (optimistic local update)
    setPendingRemovedQuestionIds(prev => [...prev, testQuestionId]);
    try {
      await fetch(`/api/tests/${testId}/questions/${testQuestionId}`, {
        method: "DELETE"
      });
      fetchTest();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenApplyModal = async () => {
    setIsApplyModalOpen(true);
    setLoadingClassrooms(true);
    try {
      const res = await fetch("/api/classrooms");
      if (res.ok) {
        const data = await res.json();
        setClassrooms(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingClassrooms(false);
    }
  };

  const applyToClassroom = async (classroomId: string) => {
    try {
      const res = await fetch(`/api/tests/${testId}/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classroomId })
      });
      if (res.ok) {
        const data = await res.json();
        setIsApplyModalOpen(false);
        router.push(`/provas/${testId}/aplicacao/${data.id}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const existingIds = test?.questions?.map((tq: any) => tq.questionId) || [];
  const visibleQuestions = test?.questions?.filter(
    (tq: any) => !pendingRemovedQuestionIds.includes(tq.id)
  ) || [];

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden">
      {test?.title && <BreadcrumbSetter segment={testId} label={test.title} />}
      {/* Header — padronizado com o resto da aplicação */}
      <div className="flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/provas")} className="-ml-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <EditableTitle
            value={title}
            onValueChange={setTitle}
            placeholder="Título da prova"
            textClassName="text-xl font-semibold tracking-tight text-foreground"
            className="-ml-2"
          />
        </div>
        <div className="flex items-center gap-2">
          {/* Adicionar questão — dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" /> Adicionar questão <ChevronDown className="w-3.5 h-3.5 ml-0.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={6}>
              <DropdownMenuItem onClick={() => setIsCreateModalOpen(true)}>
                <FileText className="w-4 h-4 mr-2" /> Criar nova
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsBankModalOpen(true)}>
                <Search className="w-4 h-4 mr-2" /> Buscar no acervo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Exportar */}
          <Link href={`/imprimir/${testId}`} target="_blank">
            <Button variant="outline" className="gap-2">
              <Printer className="w-4 h-4" /> Exportar
            </Button>
          </Link>

          {/* Avaliar turma */}
          <Button variant="outline" className="gap-2" onClick={handleOpenApplyModal}>
            <CheckCircle className="w-4 h-4" /> Avaliar turma
          </Button>
        </div>
      </div>

      {/* Editor Body — sem padding lateral extra */}
      <div className="flex-1 overflow-y-auto px-6 pb-24 py-6">
        <div className="w-full space-y-6">

          {/* Instruções */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <label className="block text-sm font-semibold text-foreground mb-2">Instruções da prova (opcional)</label>
            <Textarea
              placeholder="Digite as instruções gerais para os alunos... (Ex: Permitido uso de calculadora)"
              className="resize-none min-h-[100px] border-border bg-card"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground flex items-center justify-between">
              Questões adicionadas
              <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {visibleQuestions.length}
              </span>
            </h3>

            {visibleQuestions.length === 0 ? (
              <div className="text-center py-16 bg-card border border-dashed border-border rounded-xl">
                <p className="text-muted-foreground mb-4">Sua prova ainda não tem questões.</p>
                <div className="flex justify-center gap-3">
                  <Button variant="outline" onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Nova questão
                  </Button>
                  <Button variant="outline" onClick={() => setIsBankModalOpen(true)}>
                    <Search className="w-4 h-4 mr-2" /> Buscar no acervo
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {visibleQuestions.map((tq: any, index: number) => (
                  <div key={tq.id} className="group bg-card border border-border rounded-xl p-4 shadow-sm flex gap-4 transition-all hover:border-primary/40">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <GripVertical className="w-5 h-5 cursor-grab active:cursor-grabbing hover:text-foreground" />
                      <span className="text-xs font-medium">{index + 1}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="prose prose-sm dark:prose-invert max-w-none text-foreground" dangerouslySetInnerHTML={{ __html: tq.question.body }} />

                      <div className="mt-4 space-y-2 pl-4 border-l-2 border-border/50">
                        {tq.question.options?.map((opt: any) => (
                          <div key={opt.id} className="flex gap-2 text-sm text-muted-foreground">
                            <span className={`font-medium ${opt.isCorrect ? 'text-green-600 dark:text-green-500' : 'text-foreground'}`}>{opt.label})</span>
                            <span dangerouslySetInnerHTML={{ __html: opt.text }} />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-start gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => removeQuestion(tq.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md mt-auto">
                        Peso: {tq.weight}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Popover flutuante de salvamento */}
      {hasChanges && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in-0 duration-300">
          <div className="flex items-center gap-4 bg-card border border-border rounded-xl px-5 py-3 shadow-lg">
            <p className="text-sm text-muted-foreground">Você fez alterações nesta avaliação</p>
            <Button className="gap-2 shrink-0" onClick={handleSaveAll} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Salvar mudanças
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <QuestionBankModal
        open={isBankModalOpen}
        onOpenChange={setIsBankModalOpen}
        onAddQuestions={handleAddQuestions}
        existingQuestionIds={existingIds}
      />

      <Sheet open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <SheetContent side="right" className="w-[90vw] sm:max-w-2xl overflow-y-auto p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold">Criar questão</h2>
            <p className="text-sm text-muted-foreground">
              A questão será salva no banco e adicionada automaticamente no final desta prova.
            </p>
          </div>
          <QuestionForm
            isInline={true}
            onSuccess={handleCreateQuestionSuccess}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <Dialog open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Avaliar turma</DialogTitle>
            <DialogDescription>
              Selecione a turma para a qual deseja registrar a aplicação desta prova.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {loadingClassrooms ? (
              <div className="flex justify-center p-4">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : classrooms.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">Nenhuma turma cadastrada. Crie uma turma primeiro.</p>
            ) : (
              <div className="grid gap-2 max-h-[300px] overflow-y-auto">
                {classrooms.map((c: any) => (
                  <Button
                    key={c.id}
                    variant="outline"
                    className="justify-start h-auto py-3 px-4"
                    onClick={() => applyToClassroom(c.id)}
                  >
                    <div className="text-left">
                      <div className="font-semibold text-foreground">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.subject || 'Sem disciplina'} {c.year ? `- ${c.year}` : ''}</div>
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
