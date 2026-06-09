"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, GripVertical, X, Plus, BookOpen, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { mockQuestions } from "@/lib/mock-data/questions";
import type { Question } from "@/types";

// Mock caderno inicial
const initialCaderno: (Question & { points: number })[] = [
  { ...mockQuestions[0], points: 1 },
  { ...mockQuestions[1], points: 1 },
];

export default function MontagemdaProvaPage() {
  const [caderno, setCaderno] = React.useState(initialCaderno);
  const totalPoints = caderno.reduce((sum, q) => sum + q.points, 0);

  const addQuestion = (q: Question) => {
    if (!caderno.find((c) => c.id === q.id)) {
      setCaderno([...caderno, { ...q, points: 1 }]);
    }
  };

  const removeQuestion = (id: string) => {
    setCaderno(caderno.filter((c) => c.id !== id));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/provas">
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <input
            id="input-assessment-name"
            type="text"
            defaultValue="Nova Avaliação"
            className="text-2xl font-bold bg-transparent border-none outline-none text-foreground w-full focus:ring-0"
          />
          <p className="text-muted-foreground text-sm">Montagem do caderno de prova</p>
        </div>
        <Link href="/provas/nova/exportacao">
          <Button className="gap-2" id="btn-go-export">
            Exportar
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-[1fr_380px] gap-6 items-start">
        {/* Fonte de questões */}
        <div className="bg-card border border-border rounded-xl">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-sm">Adicionar questões</h2>
          </div>
          <Tabs defaultValue="banco">
            <TabsList className="w-full rounded-none border-b border-border bg-transparent p-0 h-auto">
              {[
                { value: "banco", label: "Banco Pessoal", icon: BookOpen },
                { value: "acervo", label: "Acervo Público", icon: Search },
                { value: "nova", label: "Criar Nova", icon: Sparkles },
              ].map(({ value, label, icon: Icon }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="flex-1 gap-1.5 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-xs py-3"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="banco" className="p-4 space-y-2">
              {mockQuestions.map((q) => {
                const isAdded = !!caderno.find((c) => c.id === q.id);
                return (
                  <div
                    key={q.id}
                    className="flex items-start justify-between gap-3 p-3 rounded-lg border border-border hover:border-primary/40 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-1">{q.discipline} · {q.yearLevel}</p>
                      <p className="text-sm text-card-foreground line-clamp-2">{q.body}</p>
                    </div>
                    <Button
                      size="sm"
                      variant={isAdded ? "secondary" : "outline"}
                      className="shrink-0 h-7 text-xs gap-1"
                      onClick={() => addQuestion(q)}
                      disabled={isAdded}
                    >
                      <Plus className="w-3 h-3" />
                      {isAdded ? "Adicionada" : "Add"}
                    </Button>
                  </div>
                );
              })}
            </TabsContent>

            <TabsContent value="acervo" className="p-4">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Buscar no acervo público..."
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <p className="text-sm text-muted-foreground text-center py-8">
                Digite para buscar no acervo público
              </p>
            </TabsContent>

            <TabsContent value="nova" className="p-4">
              <Link href="/questoes/novo">
                <Button className="w-full gap-2">
                  <Sparkles className="w-4 h-4" />
                  Abrir editor de questões
                </Button>
              </Link>
            </TabsContent>
          </Tabs>
        </div>

        {/* Caderno de prova */}
        <div className="bg-card border border-border rounded-xl sticky top-6">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-sm">
                Caderno ({caderno.length} questões)
              </h2>
              <span className="text-xs text-muted-foreground">{totalPoints} pontos no total</span>
            </div>
            <Progress value={(totalPoints / 10) * 100} className="h-1.5" />
          </div>

          {caderno.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Adicione questões ao caderno
            </div>
          ) : (
            <div className="p-3 space-y-2 max-h-[60vh] overflow-y-auto">
              {caderno.map((q, idx) => (
                <div
                  key={q.id}
                  className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 border border-border group"
                >
                  <GripVertical className="w-4 h-4 text-muted-foreground mt-0.5 cursor-grab shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-xs font-mono font-bold text-primary">Q{idx + 1}</span>
                      <Badge variant="outline" className="text-xs h-4 px-1">{q.discipline}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{q.body}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <label className="text-xs text-muted-foreground">Pontos:</label>
                      <input
                        type="number"
                        value={q.points}
                        min={0.5}
                        step={0.5}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 1;
                          setCaderno(caderno.map((c) => c.id === q.id ? { ...c, points: val } : c));
                        }}
                        className="w-14 px-1.5 py-0.5 text-xs rounded border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => removeQuestion(q.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors mt-0.5 shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="p-4 border-t border-border">
            <Link href="/provas/nova/exportacao">
              <Button className="w-full" disabled={caderno.length === 0} id="btn-proceed-export">
                Avançar para exportação
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
