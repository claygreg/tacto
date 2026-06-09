"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Plus, Trash2, Search, Printer, Loader2, FileText } from "lucide-react";
import type { Question } from "@/types";

export default function MontagemProvaPage() {
  const params = useParams();
  const id = params.id as string;

  const [assessment, setAssessment] = useState<any>(null);
  const [bankQuestions, setBankQuestions] = useState<Question[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [resAssessment, resQuestions] = await Promise.all([
        fetch(`/api/assessments/${id}`),
        fetch(`/api/questions`), // Busca banco pessoal inteiro
      ]);

      if (resAssessment.ok && resQuestions.ok) {
        setAssessment(await resAssessment.json());
        setBankQuestions(await resQuestions.json());
      }
    } catch (err) {
      console.error("Erro ao carregar dados", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddQuestion = async (questionId: string) => {
    try {
      const res = await fetch(`/api/assessments/${id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId }),
      });
      if (res.ok) {
        fetchData(); // recarrega para atualizar a prova
      }
    } catch (err) {
      console.error("Erro ao adicionar", err);
    }
  };

  const handleRemoveQuestion = async (itemId: string) => {
    try {
      const res = await fetch(`/api/assessments/${id}/items?itemId=${itemId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Erro ao remover", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!assessment) {
    return <div className="text-center py-10">Prova não encontrada.</div>;
  }

  // Filtra as questões do banco (remove as que já estão na prova e aplica busca)
  const itemsInAssessment = new Set(assessment.items.map((i: any) => i.question.id));
  const availableQuestions = bankQuestions.filter((q) => {
    if (itemsInAssessment.has(q.id)) return false;
    if (search && !q.body.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/provas">
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Montar Avaliação</h1>
            <p className="text-muted-foreground text-sm">
              {assessment.name} • {assessment.classroomName}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Link href={`/provas/${id}/imprimir`}>
            <Button className="gap-2">
              <Printer className="w-4 h-4" />
              Imprimir / Exportar
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Lado esquerdo: Caderno de Prova */}
        <div className="w-1/2 flex flex-col bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/20 shrink-0 flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Caderno de Prova
            </h2>
            <Badge variant="outline">{assessment.items.length} questões</Badge>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {assessment.items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                <FileText className="w-12 h-12 mb-3 opacity-20" />
                <p>O caderno está vazio.</p>
                <p className="text-sm mt-1">Adicione questões do banco ao lado.</p>
              </div>
            ) : (
              assessment.items.map((item: any, index: number) => (
                <div key={item.id} className="p-4 rounded-lg border border-border bg-background relative group">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded">
                      Questão {index + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 text-destructive opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2"
                      onClick={() => handleRemoveQuestion(item.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <p className="text-sm line-clamp-3 leading-relaxed mt-2">{item.question.body}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Lado direito: Banco de Questões */}
        <div className="w-1/2 flex flex-col bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/20 shrink-0 space-y-3">
            <h2 className="font-semibold">Seu Banco de Questões</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar no banco..."
                className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {availableQuestions.length === 0 ? (
              <div className="text-center p-6 text-muted-foreground text-sm">
                Nenhuma questão disponível para adicionar.
              </div>
            ) : (
              availableQuestions.map((q) => (
                <div key={q.id} className="p-4 rounded-lg border border-border bg-background hover:border-primary/40 transition-colors flex items-start gap-3 group">
                  <div className="flex-1 min-w-0">
                    <div className="flex gap-2 mb-2">
                      <Badge variant="outline" className="text-[10px] h-5">{q.discipline}</Badge>
                      <Badge variant="outline" className="text-[10px] h-5">
                        {q.type === "multiple_choice" ? "Obj" : "Disc"}
                      </Badge>
                    </div>
                    <p className="text-sm line-clamp-2 leading-relaxed">{q.body}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="shrink-0 gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleAddQuestion(q.id)}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
