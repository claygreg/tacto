"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sparkles, Save, ChevronLeft, Loader2, AlertCircle, Folder as FolderIcon } from "lucide-react";
import Link from "next/link";
import type { QuestionFolder } from "@/types";

const disciplines = ["Matemática", "Ciências", "Português", "História", "Geografia", "Física", "Química", "Biologia"];
const yearLevels = ["6º Ano", "7º Ano", "8º Ano", "9º Ano", "1º EM", "2º EM", "3º EM"];
const difficulties = ["Fácil", "Médio", "Difícil"];

interface QuestionFormProps {
  isInline?: boolean;
  onSuccess?: (questionId: string) => void;
  onCancel?: () => void;
  initialFolderId?: string;
}

export function QuestionForm({ isInline, onSuccess, onCancel, initialFolderId: propFolderId }: QuestionFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialFolderId = propFolderId || searchParams?.get("folderId") || "";

  // ── Form States (The single source of truth) ──
  const [folderId, setFolderId] = React.useState(initialFolderId);
  const [type, setType] = React.useState("multiple_choice");
  const [discipline, setDiscipline] = React.useState(disciplines[0]);
  const [difficulty, setDifficulty] = React.useState("Médio");
  const [baseText, setBaseText] = React.useState("");
  const [body, setBody] = React.useState("");
  const [options, setOptions] = React.useState([
    { label: "A", text: "", isCorrect: false },
    { label: "B", text: "", isCorrect: false },
    { label: "C", text: "", isCorrect: false },
    { label: "D", text: "", isCorrect: false },
    { label: "E", text: "", isCorrect: false },
  ]);
  const [correctOption, setCorrectOption] = React.useState<string | null>(null);
  
  // App-level state
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const [folders, setFolders] = React.useState<QuestionFolder[]>([]);
  const [foldersLoading, setFoldersLoading] = React.useState(true);

  // ── AI Assistant States ──
  const [aiModalOpen, setAiModalOpen] = React.useState(false);
  const [aiTopic, setAiTopic] = React.useState("");
  const [aiYearLevel, setAiYearLevel] = React.useState(yearLevels[0]);
  const [aiGenerationState, setAiGenerationState] = React.useState<"idle" | "loading" | "done">("idle");
  const [aiError, setAiError] = React.useState("");

  // Fetch folders on mount
  React.useEffect(() => {
    async function fetchFolders() {
      try {
        const res = await fetch("/api/folders");
        if (res.ok) {
          const data = await res.json();
          setFolders(data);
          // Auto-select first folder if none selected
          if (!initialFolderId && data.length > 0) {
            setFolderId(data[0].id);
          }
        }
      } finally {
        setFoldersLoading(false);
      }
    }
    fetchFolders();
  }, [initialFolderId]);

  // ── Handlers ──

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    if (!folderId) {
      setError("Você deve selecionar uma Pasta para salvar a questão.");
      setSaving(false);
      return;
    }

    if (!body.trim()) {
      setError("O enunciado é obrigatório.");
      setSaving(false);
      return;
    }

    if (type === "multiple_choice") {
      const filledOptions = options.filter((o) => o.text.trim() !== "");
      if (filledOptions.length < 2) {
        setError("Preencha pelo menos 2 alternativas.");
        setSaving(false);
        return;
      }
      if (!correctOption) {
        setError("Selecione qual é a alternativa correta clicando na letra.");
        setSaving(false);
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
        folderId,
        type,
        body,
        baseText: baseText || null,
        discipline,
        difficulty: difficultyMap[difficulty],
        source: "personal",
        options: type === "multiple_choice" 
          ? options.filter((o) => o.text.trim() !== "").map(o => ({
              label: o.label,
              text: o.text,
              isCorrect: o.label === correctOption,
            }))
          : undefined,
      };

      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Falha ao salvar questão. Verifique a API.");
      }

      const createdQuestion = await res.json();

      if (onSuccess) {
        onSuccess(createdQuestion.id);
      } else {
        router.push("/questoes");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateAI = async () => {
    setAiError("");
    if (!aiTopic.trim()) {
      setAiError("Por favor, informe um Tema ou Habilidade BNCC.");
      return;
    }

    setAiGenerationState("loading");
    
    try {
      const res = await fetch("/api/ai/generate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discipline, // Use the one already selected in the form
          yearLevel: aiYearLevel,
          topic: aiTopic,
          type,       // Use the one already selected in the form
          difficulty, // Use the one already selected in the form
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.details || data.message || "Erro ao gerar questão pela IA.");
      }

      // Populate form fields with generated data
      if (data.baseText) setBaseText(data.baseText);
      if (data.body) setBody(data.body);
      
      if (data.type === "multiple_choice" && data.options) {
        // Map AI options to our local structure
        const newOptions = [...options];
        let correctLabel = null;
        
        data.options.forEach((aiOpt: any, idx: number) => {
          if (idx < newOptions.length) {
            newOptions[idx].text = aiOpt.text;
            if (aiOpt.isCorrect) correctLabel = newOptions[idx].label;
          }
        });
        
        setOptions(newOptions);
        if (correctLabel) setCorrectOption(correctLabel);
      }

      setAiGenerationState("idle");
      setAiModalOpen(false); // Close modal automatically
      setAiTopic(""); // Clear input for next time

    } catch (err: any) {
      setAiError(err.message);
      setAiGenerationState("idle");
    }
  };


  return (
    <div className={`w-full ${!isInline ? "w-full pb-20 -mt-2" : "pb-10"}`}>
      {/* Header */}
      {!isInline && (
        <div className="flex items-center gap-3 mb-6">
          <Link href="/questoes">
            <Button variant="ghost" size="icon" className="w-8 h-8 shrink-0 bg-background border shadow-sm">
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Criar Questão</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Preencha os campos ou use a inteligência artificial para rascunhar o texto.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className={`grid grid-cols-1 ${!isInline ? "lg:grid-cols-12 gap-6 items-start" : "gap-6"}`}>
        
        {/* ── Config & Metadata ── */}
        <div className={`${!isInline ? "lg:col-span-4" : ""} space-y-5`}>
          
          {/* AI Assistant Button */}
          <div className="p-5 rounded-xl border border-primary/20 bg-primary/5 text-center">
             <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
               <Sparkles className="w-6 h-6 text-primary" />
             </div>
             <h3 className="font-semibold text-foreground mb-1">Sem tempo?</h3>
             <p className="text-xs text-muted-foreground mb-4">Deixe a IA criar um rascunho de alta qualidade para você revisar.</p>
             <Button 
               type="button" 
               className="w-full gap-2 shadow-sm" 
               onClick={() => setAiModalOpen(true)}
             >
               <Sparkles className="w-4 h-4" /> Gerar com IA
             </Button>
          </div>

          {/* Configuration Form */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
            <h3 className="font-semibold text-sm mb-4 border-b pb-2 flex items-center gap-2">
              <FolderIcon className="w-4 h-4 text-muted-foreground" />
              Configuração
            </h3>

            {/* Folder Selection */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5 uppercase tracking-wider">
                Pasta de Destino *
              </label>
              <select
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                disabled={foldersLoading}
                className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                required
              >
                {foldersLoading && <option value="">Carregando pastas...</option>}
                {!foldersLoading && folders.length === 0 && <option value="">Crie uma pasta primeiro</option>}
                {!foldersLoading && <option value="" disabled>Selecione uma pasta...</option>}
                {!foldersLoading && folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>

            <div className={`grid ${isInline ? "grid-cols-3 gap-3" : "grid-cols-1 gap-4"}`}>
              {/* Discipline */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5 uppercase tracking-wider">Disciplina</label>
                <select
                  value={discipline}
                  onChange={(e) => setDiscipline(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {disciplines.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>

              {/* Difficulty */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5 uppercase tracking-wider">Dificuldade</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {difficulties.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>

              {/* Question Type */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5 uppercase tracking-wider">Tipo da Questão</label>
                <select
                  value={type}
                  onChange={(e) => {
                    setType(e.target.value);
                    if (e.target.value === "discursive") setCorrectOption(null);
                  }}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="multiple_choice">Múltipla Escolha</option>
                  <option value="discursive">Discursiva</option>
                </select>
              </div>
            </div>

          </div>
        </div>

        {/* ── Editor ── */}
        <div className={`${!isInline ? "lg:col-span-8 min-h-[600px]" : ""} bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col h-full`}>
          
          {error && (
            <div className="mb-6 bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="flex-1 space-y-6">
            {/* Base Text */}
            <div>
              <label className="text-sm font-semibold block mb-1.5">
                Texto-base / Contexto <span className="text-muted-foreground font-normal text-xs ml-1">(opcional)</span>
              </label>
              <textarea
                rows={3}
                value={baseText}
                onChange={(e) => setBaseText(e.target.value)}
                placeholder="Insira um texto de apoio, poema, ou contexto se necessário..."
                className="w-full px-4 py-3 text-sm rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-shadow"
              />
            </div>

            {/* Enunciado */}
            <div>
              <label className="text-sm font-semibold block mb-1.5">Enunciado *</label>
              <textarea
                rows={5}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Digite a pergunta da questão..."
                className="w-full px-4 py-3 text-sm rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-shadow"
                required
              />
            </div>

            {/* Alternatives */}
            {type === "multiple_choice" && (
              <div className="pt-4 border-t border-border/50">
                <div className="flex items-center justify-between mb-4">
                   <p className="text-sm font-semibold">Alternativas</p>
                   <p className="text-xs text-muted-foreground">Clique na letra correspondente para marcar a resposta correta.</p>
                </div>
                
                <div className="space-y-3">
                  {options.map((opt, idx) => (
                    <div key={opt.label} className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => setCorrectOption(opt.label)}
                        className={`w-8 h-8 rounded-full border flex items-center justify-center text-sm font-mono font-bold shrink-0 transition-all mt-1 ${
                          correctOption === opt.label
                            ? "bg-emerald-500 text-white border-emerald-500 ring-2 ring-emerald-500/20 ring-offset-2 ring-offset-background"
                            : "border-border text-muted-foreground bg-muted hover:border-emerald-500/50 hover:text-emerald-600"
                        }`}
                        title="Marcar como correta"
                      >
                        {opt.label}
                      </button>
                      <textarea
                        rows={2}
                        value={opt.text}
                        onChange={(e) => {
                          const newOpts = [...options];
                          newOpts[idx].text = e.target.value;
                          setOptions(newOpts);
                        }}
                        placeholder={`Texto da alternativa ${opt.label}...`}
                        className={`flex-1 px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all ${
                          correctOption === opt.label ? "border-emerald-500/40 bg-emerald-500/5" : "border-input text-foreground placeholder:text-muted-foreground"
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-6 mt-6 border-t border-border flex justify-end gap-3">
             <Button type="button" variant="ghost" onClick={onCancel || (() => router.back())}>
               Cancelar
             </Button>
             <Button type="submit" className="gap-2 px-8 shadow-sm" disabled={saving}>
               {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
               {saving ? "Salvando..." : "Salvar Questão"}
             </Button>
          </div>

        </div>
      </form>

      {/* ── AI Assistant Dialog ── */}
      <Dialog open={aiModalOpen} onOpenChange={setAiModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Assistente de IA
            </DialogTitle>
            <DialogDescription>
              A inteligência artificial vai gerar um rascunho preenchendo o formulário principal para você revisar.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {aiError && (
              <div className="bg-destructive/15 text-destructive text-xs p-3 rounded-md">
                {aiError}
              </div>
            )}

            <div>
              <label className="text-sm font-medium block mb-1.5">Ano Escolar (Contexto)</label>
              <select
                value={aiYearLevel}
                onChange={(e) => setAiYearLevel(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {yearLevels.map((y) => <option key={y}>{y}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Tema ou Habilidade BNCC *</label>
              <textarea
                rows={3}
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                placeholder="Ex: Revolução Francesa, Fotossíntese, EF09CI07..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
            
            <div className="bg-muted/50 p-3 rounded-lg border border-border/50">
               <p className="text-xs text-muted-foreground">
                 A IA usará a <strong>Disciplina ({discipline})</strong>, <strong>Tipo ({type === 'multiple_choice' ? 'Objetiva' : 'Discursiva'})</strong> e <strong>Dificuldade ({difficulty})</strong> já selecionados no formulário lateral.
               </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button variant="ghost" onClick={() => setAiModalOpen(false)}>Cancelar</Button>
            <Button 
              onClick={handleGenerateAI} 
              disabled={aiGenerationState === "loading" || !aiTopic.trim()}
              className="gap-2"
            >
              {aiGenerationState === "loading" ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Rascunhando...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Gerar Conteúdo</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
