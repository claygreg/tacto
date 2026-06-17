"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Plus, Check } from "lucide-react";

interface Question {
  id: string;
  body: string;
  type: string;
  difficulty: string | null;
  discipline: string | null;
  options?: any[];
}

interface QuestionBankModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddQuestions: (questionIds: string[]) => Promise<void>;
  existingQuestionIds: string[];
}

export function QuestionBankModal({ open, onOpenChange, onAddQuestions, existingQuestionIds }: QuestionBankModalProps) {
  const [loading, setLoading] = React.useState(false);
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [adding, setAdding] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      fetchQuestions();
      setSelectedIds(new Set());
    }
  }, [open]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      // Temporarily fetching all questions (we should implement pagination/folders later)
      const res = await fetch("/api/questions");
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleConfirm = async () => {
    if (selectedIds.size === 0) return;
    setAdding(true);
    try {
      await onAddQuestions(Array.from(selectedIds));
      onOpenChange(false);
    } finally {
      setAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <DialogTitle>Banco de Questões</DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          <Tabs defaultValue="meu-banco" className="flex-1 flex flex-col h-full">
            <div className="px-6 py-2 border-b border-border">
              <TabsList>
                <TabsTrigger value="meu-banco">Meu Banco</TabsTrigger>
                <TabsTrigger value="acervo">Acervo Público</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="meu-banco" className="flex-1 m-0 min-h-0 flex flex-col data-[state=active]:flex">
              <ScrollArea className="flex-1 p-6">
                {loading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : questions.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    Nenhuma questão encontrada no seu banco.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {questions.map((q) => {
                      const isExisting = existingQuestionIds.includes(q.id);
                      const isSelected = selectedIds.has(q.id);

                      return (
                        <div 
                          key={q.id}
                          onClick={() => !isExisting && toggleSelect(q.id)}
                          className={`
                            p-4 rounded-xl border transition-all cursor-pointer flex gap-4
                            ${isExisting ? "opacity-50 bg-muted/50 cursor-not-allowed border-border" : ""}
                            ${isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary/40 bg-card"}
                          `}
                        >
                          <div className="pt-1">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors
                              ${isSelected ? "bg-primary border-primary text-primary-foreground" : "border-input"}
                              ${isExisting ? "bg-muted border-border" : ""}
                            `}>
                              {(isSelected || isExisting) && <Check className="w-3.5 h-3.5" />}
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 text-xs">
                              {q.discipline && <span className="text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{q.discipline}</span>}
                              {q.difficulty && <span className="text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{q.difficulty}</span>}
                              {isExisting && <span className="text-primary font-medium ml-auto">Já adicionada</span>}
                            </div>
                            <div className="prose prose-sm dark:prose-invert max-w-none line-clamp-3 text-foreground" dangerouslySetInnerHTML={{ __html: q.body }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="acervo" className="flex-1 m-0 p-6 flex flex-col items-center justify-center text-muted-foreground">
              Integração com Acervo Público em breve.
            </TabsContent>
          </Tabs>
        </div>

        <div className="p-4 border-t border-border bg-muted/30 flex items-center justify-between mt-auto">
          <span className="text-sm text-muted-foreground">
            {selectedIds.size} {selectedIds.size === 1 ? 'questão selecionada' : 'questões selecionadas'}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleConfirm} disabled={selectedIds.size === 0 || adding}>
              {adding && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Adicionar à Prova
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
