"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Sparkles, PenLine, RefreshCw, Save, ChevronLeft } from "lucide-react";
import Link from "next/link";

const disciplines = ["Matemática", "Ciências", "Português", "História", "Geografia", "Física", "Química", "Biologia"];
const yearLevels = ["6º Ano", "7º Ano", "8º Ano", "9º Ano", "1º EM", "2º EM", "3º EM"];
const difficulties = ["Fácil", "Médio", "Difícil"];

export default function EditorQuestaoPage() {
  const router = useRouter();

  // Manual Form State
  const [manualType, setManualType] = React.useState("multiple_choice");
  const [manualDiscipline, setManualDiscipline] = React.useState(disciplines[0]);
  const [manualDifficulty, setManualDifficulty] = React.useState("Médio");
  const [manualBaseText, setManualBaseText] = React.useState("");
  const [manualBody, setManualBody] = React.useState("");
  const [manualOptions, setManualOptions] = React.useState([
    { label: "A", text: "", isCorrect: false },
    { label: "B", text: "", isCorrect: false },
    { label: "C", text: "", isCorrect: false },
    { label: "D", text: "", isCorrect: false },
    { label: "E", text: "", isCorrect: false },
  ]);
  const [manualCorrect, setManualCorrect] = React.useState<string | null>(null);
  const [manualSaving, setManualSaving] = React.useState(false);
  const [manualError, setManualError] = React.useState("");

  // AI Form State
  const [aiDiscipline, setAiDiscipline] = React.useState(disciplines[0]);
  const [aiYearLevel, setAiYearLevel] = React.useState(yearLevels[0]);
  const [aiTopic, setAiTopic] = React.useState("");
  const [aiType, setAiType] = React.useState("multiple_choice");
  const [aiDifficulty, setAiDifficulty] = React.useState("Médio");
  const [generationState, setGenerationState] = React.useState<"idle" | "loading" | "done">("idle");
  const [generatedData, setGeneratedData] = React.useState<any>(null);
  const [aiCorrect, setAiCorrect] = React.useState<string | null>(null);
  const [aiSaving, setAiSaving] = React.useState(false);
  const [aiError, setAiError] = React.useState("");

  const handleManualSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualError("");
    setManualSaving(true);

    if (!manualBody.trim()) {
      setManualError("O enunciado é obrigatório.");
      setManualSaving(false);
      return;
    }

    if (manualType === "multiple_choice") {
      const filledOptions = manualOptions.filter((o) => o.text.trim() !== "");
      if (filledOptions.length < 2) {
        setManualError("Preencha pelo menos 2 alternativas.");
        setManualSaving(false);
        return;
      }
      if (!manualCorrect) {
        setManualError("Selecione qual é a alternativa correta clicando na letra.");
        setManualSaving(false);
        return;
      }
    }

    try {
      const difficultyMap: Record<string, string> = {
        "Fácil": "easy",
        "Médio": "medium",
        "Difícil": "hard",
      };

      const payload = {
        type: manualType,
        body: manualBody,
        baseText: manualBaseText || null,
        discipline: manualDiscipline,
        difficulty: difficultyMap[manualDifficulty],
        source: "personal",
        options: manualType === "multiple_choice" 
          ? manualOptions.filter((o) => o.text.trim() !== "").map(o => ({
              label: o.label,
              text: o.text,
              isCorrect: o.label === manualCorrect,
            }))
          : undefined,
      };

      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Falha ao salvar questão.");
      }

      router.push("/questoes");
    } catch (err: any) {
      setManualError(err.message);
    } finally {
      setManualSaving(false);
    }
  };

  const handleGenerate = async () => {
    setAiError("");
    if (!aiTopic.trim()) {
      setAiError("Por favor, informe um Tema ou Habilidade BNCC.");
      return;
    }

    setGenerationState("loading");
    
    try {
      const res = await fetch("/api/ai/generate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discipline: aiDiscipline,
          yearLevel: aiYearLevel,
          topic: aiTopic,
          type: aiType,
          difficulty: aiDifficulty,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.details || data.message || "Erro ao gerar questão pela IA.");
      }

      setGeneratedData(data);
      if (data.options) {
        const correctOpt = data.options.find((o: any) => o.isCorrect);
        setAiCorrect(correctOpt ? correctOpt.label : null);
      }
      setGenerationState("done");
    } catch (err: any) {
      setAiError(err.message);
      setGenerationState("idle");
    }
  };

  const handleAiSave = async () => {
    if (!generatedData) return;
    setAiSaving(true);
    setAiError("");

    try {
      const difficultyMap: Record<string, string> = {
        "Fácil": "easy",
        "Médio": "medium",
        "Difícil": "hard",
      };

      const payload = {
        ...generatedData,
        difficulty: difficultyMap[aiDifficulty],
        yearLevel: aiYearLevel,
        source: "ai_generated",
        options: generatedData.type === "multiple_choice" 
          ? generatedData.options.map((o: any) => ({
              ...o,
              isCorrect: o.label === aiCorrect,
            }))
          : undefined,
      };

      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Falha ao salvar questão gerada.");

      router.push("/questoes");
    } catch (err: any) {
      setAiError(err.message);
    } finally {
      setAiSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/questoes">
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Nova Questão</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Gere com IA ou crie manualmente
          </p>
        </div>
      </div>

      <Tabs defaultValue="ia">
        <TabsList className="w-full max-w-xs">
          <TabsTrigger value="ia" className="flex-1 gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            Gerar com IA
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex-1 gap-2">
            <PenLine className="w-3.5 h-3.5" />
            Manual
          </TabsTrigger>
        </TabsList>

        {/* IA Mode */}
        <TabsContent value="ia" className="mt-6 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-semibold mb-4">Parâmetros de geração</h2>
            {aiError && !generatedData && (
              <div className="mb-4 bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                {aiError}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">Disciplina</label>
                <select
                  value={aiDiscipline}
                  onChange={(e) => setAiDiscipline(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {disciplines.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Ano Escolar</label>
                <select
                  value={aiYearLevel}
                  onChange={(e) => setAiYearLevel(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {yearLevels.map((y) => <option key={y}>{y}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium block mb-1.5">Tema / Habilidade BNCC *</label>
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="Ex: Mitose e Meiose / EF09CI07"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Tipo de questão</label>
                <select
                  value={aiType}
                  onChange={(e) => setAiType(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="multiple_choice">Múltipla Escolha</option>
                  <option value="discursive">Discursiva</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Dificuldade</label>
                <select
                  value={aiDifficulty}
                  onChange={(e) => setAiDifficulty(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {difficulties.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <Button
              className="mt-5 gap-2"
              onClick={handleGenerate}
              disabled={generationState === "loading"}
            >
              {generationState === "loading" ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Gerar Questão
                </>
              )}
            </Button>
          </div>

          {/* Resultado gerado */}
          {generationState === "done" && generatedData && (
            <div className="bg-card border border-border rounded-xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Questão gerada</h2>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Gerada por IA
                  </Badge>
                  <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs" onClick={handleGenerate}>
                    <RefreshCw className="w-3 h-3" />
                    Gerar outra
                  </Button>
                </div>
              </div>

              {aiError && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                  {aiError}
                </div>
              )}

              {/* Texto-base */}
              {generatedData.baseText && (
                <div className="p-3 bg-muted/40 rounded-lg border-l-2 border-primary/50">
                  <p className="text-xs text-muted-foreground font-medium mb-1">Texto-base</p>
                  <p className="text-sm text-card-foreground">{generatedData.baseText}</p>
                </div>
              )}

              {/* Enunciado */}
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-1.5">Enunciado</p>
                <p className="text-sm text-card-foreground leading-relaxed whitespace-pre-wrap">{generatedData.body}</p>
              </div>

              {/* Alternativas */}
              {generatedData.type === "multiple_choice" && generatedData.options && (
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-2">
                    Alternativas <span className="text-primary">(clique na letra para marcar a correta)</span>
                  </p>
                  <div className="space-y-2">
                    {generatedData.options.map((opt: any) => (
                      <button
                        key={opt.label}
                        onClick={() => setAiCorrect(opt.label)}
                        className={`w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-colors text-sm ${
                          aiCorrect === opt.label
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border hover:border-primary/40 text-card-foreground"
                        }`}
                      >
                        <span className={`font-mono font-bold shrink-0 w-5 ${aiCorrect === opt.label ? "text-primary" : "text-muted-foreground"}`}>
                          {opt.label}
                        </span>
                        <span>{opt.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Explicação */}
              {generatedData.explanation && (
                <div className="p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
                  <p className="text-xs font-medium text-green-500 mb-1">Explicação (visível só para o professor)</p>
                  <p className="text-sm text-muted-foreground">{generatedData.explanation}</p>
                </div>
              )}

              <Button className="gap-2 w-full" onClick={handleAiSave} disabled={aiSaving}>
                <Save className="w-4 h-4" />
                {aiSaving ? "Salvando..." : "Salvar no Banco Pessoal"}
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Manual Mode */}
        <TabsContent value="manual" className="mt-6">
          <form onSubmit={handleManualSave} className="bg-card border border-border rounded-xl p-6 space-y-5">
            <h2 className="font-semibold">Criar questão manualmente</h2>

            {manualError && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                {manualError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">Tipo</label>
                <select
                  value={manualType}
                  onChange={(e) => {
                    setManualType(e.target.value);
                    if (e.target.value === "discursive") setManualCorrect(null);
                  }}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="multiple_choice">Múltipla Escolha</option>
                  <option value="discursive">Discursiva</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Disciplina</label>
                <select
                  value={manualDiscipline}
                  onChange={(e) => setManualDiscipline(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {disciplines.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Dificuldade</label>
                <select
                  value={manualDifficulty}
                  onChange={(e) => setManualDifficulty(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {difficulties.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">
                Texto-base <span className="text-muted-foreground font-normal">(opcional)</span>
              </label>
              <textarea
                rows={3}
                value={manualBaseText}
                onChange={(e) => setManualBaseText(e.target.value)}
                placeholder="Insira o texto de apoio à questão..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Enunciado *</label>
              <textarea
                rows={4}
                value={manualBody}
                onChange={(e) => setManualBody(e.target.value)}
                placeholder="Digite o enunciado da questão..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                required
              />
            </div>

            {manualType === "multiple_choice" && (
              <div>
                <p className="text-sm font-medium mb-2">Alternativas <span className="text-muted-foreground font-normal">(clique na letra para marcar a correta)</span></p>
                <div className="space-y-2">
                  {manualOptions.map((opt, idx) => (
                    <div key={opt.label} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setManualCorrect(opt.label)}
                        className={`w-7 h-7 rounded-full border text-sm font-mono font-bold shrink-0 transition-colors ${
                          manualCorrect === opt.label
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                        }`}
                      >
                        {opt.label}
                      </button>
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => {
                          const newOpts = [...manualOptions];
                          newOpts[idx].text = e.target.value;
                          setManualOptions(newOpts);
                        }}
                        placeholder={`Alternativa ${opt.label}`}
                        className={`flex-1 px-3 py-1.5 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-ring ${
                          manualCorrect === opt.label ? "border-primary text-foreground" : "border-input text-foreground placeholder:text-muted-foreground"
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button type="submit" className="gap-2 w-full" disabled={manualSaving}>
              <Save className="w-4 h-4" />
              {manualSaving ? "Salvando..." : "Salvar no Banco Pessoal"}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
