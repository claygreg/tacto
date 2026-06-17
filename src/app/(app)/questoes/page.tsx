"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Search,
  FolderPlus,
  Folder as FolderIcon,
  FolderOpen,
  MoreHorizontal,
  Trash2,
  Edit2,
  Check,
  X,
  Loader2,
  Sparkles,
  FilePlus,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Globe,
  Library,
  Pin,
  CircleDot,
  Image as ImageIcon,
} from "lucide-react";
import type { Question, QuestionFolder, QuestionDifficulty, QuestionOption } from "@/types";
import { EditableTitle } from "@/components/ui/editable-title";
import {
  DIFFICULTY_LABEL,
  DIFFICULTY_CLASS,
  DISCIPLINES_LIST,
  QUESTION_TYPES_FILTER,
  DIFFICULTIES_FILTER,
} from "@/lib/constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ── Constants ────────────────────────────────────────────────

const FOLDER_COLORS = [
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#f59e0b", // amber
  "#10b981", // emerald
  "#3b82f6", // blue
  "#ef4444", // red
  "#64748b", // slate
];

const DIFFICULTY_DOT_COLOR: Record<QuestionDifficulty, string> = {
  easy: "bg-emerald-500",
  medium: "bg-amber-500",
  hard: "bg-red-500",
};

// ── Shared Filter Chip ────────────────────────────────────────

function FilterChip({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  const isActive = value !== options[0];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${isActive
          ? "bg-primary text-primary-foreground border-primary"
          : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground bg-background"
          }`}
      >
        {isActive ? value : label}
        <ChevronDown className="w-3 h-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-40">
        <DropdownMenuGroup>
          {options.map((opt) => (
            <DropdownMenuItem key={opt} onClick={() => onChange(opt)}>
              {value === opt && <Check className="mr-2 h-3.5 w-3.5" />}
              {value !== opt && <span className="mr-2 w-3.5" />}
              {opt}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ── Question Card (Compact) ──────────────────────────────────

function QuestionCard({
  question,
  onClick,
  onDelete,
  onRemoveFromFolder,
  onSaveToFolder,
  isPublic = false,
}: {
  question: Question;
  onClick: () => void;
  onDelete?: (id: string) => void;
  onRemoveFromFolder?: (questionId: string) => void;
  onSaveToFolder?: (questionId: string) => void;
  isPublic?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 hover:shadow-sm transition-all duration-200 group relative flex flex-col cursor-pointer h-full"
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 truncate">
          {question.difficulty && (
            <div
              className={`w-2 h-2 rounded-full shrink-0 ${DIFFICULTY_DOT_COLOR[question.difficulty as QuestionDifficulty] || "bg-muted-foreground"}`}
              title={DIFFICULTY_LABEL[question.difficulty as QuestionDifficulty]}
            />
          )}
          <span className="text-xs font-semibold uppercase text-muted-foreground truncate">
            {question.discipline || "Geral"}
          </span>
          {question.source === "ai_generated" && (
            <span title="Gerada por IA" className="flex items-center">
              <Sparkles className="w-3 h-3 text-primary shrink-0" />
            </span>
          )}
          {question.imageUrl && (
            <span title="Contém imagem" className="flex items-center">
              <ImageIcon className="w-3 h-3 text-muted-foreground shrink-0" />
            </span>
          )}
          {isPublic && (
            <span title="Biblioteca" className="flex items-center">
              <Globe className="w-3 h-3 text-blue-500 shrink-0" />
            </span>
          )}
        </div>

        {/* Card Actions (Hover) */}
        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity -mt-1 -mr-1">
          {isPublic && onSaveToFolder && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-primary hover:bg-primary/10"
              onClick={(e) => { e.stopPropagation(); onSaveToFolder(question.id); }}
              title="Salvar na Pasta"
            >
              <Pin className="w-3.5 h-3.5" />
            </Button>
          )}

          {!isPublic && onRemoveFromFolder && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              onClick={(e) => { e.stopPropagation(); onRemoveFromFolder(question.id); }}
              title="Remover da pasta"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          )}

          {!isPublic && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={(e) => { e.stopPropagation(); onDelete(question.id); }}
              title="Excluir"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Body (Truncated) */}
      <p className="text-sm text-card-foreground leading-relaxed line-clamp-2 mb-3 flex-1">
        {question.body}
      </p>

      {/* Footer Meta */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border pt-2 mt-auto">
        <span>{question.type === "multiple_choice" ? "Múltipla Escolha" : "Discursiva"}</span>
        {question.yearLevel && <span>{question.yearLevel}</span>}
      </div>
    </div>
  );
}

// ── Question Detail Sheet ────────────────────────────────────

function QuestionDetailSheet({
  question,
  open,
  onOpenChange,
  onSaveToFolder,
  onRemoveFromFolder,
  isPublic,
  currentFolderId,
}: {
  question: Question | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSaveToFolder?: (id: string) => void;
  onRemoveFromFolder?: (id: string) => void;
  isPublic: boolean;
  currentFolderId: string | null;
}) {
  const router = useRouter();

  if (!question) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto sm:rounded-l-2xl p-0 flex flex-col">
        {/* Header (Sticky) */}
        <div className="px-6 py-4 border-b border-border bg-background sticky top-0 z-10">
          <SheetHeader className="text-left space-y-1 pr-8">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {question.discipline && <Badge variant="outline" className="text-xs font-medium">{question.discipline}</Badge>}
              {question.yearLevel && <Badge variant="secondary" className="text-xs bg-muted">{question.yearLevel}</Badge>}
              {question.difficulty && (
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${DIFFICULTY_CLASS[question.difficulty as QuestionDifficulty] || "border-border text-muted-foreground"}`}>
                  {DIFFICULTY_LABEL[question.difficulty as QuestionDifficulty] || question.difficulty}
                </span>
              )}
              {question.bnccCode && <Badge variant="outline" className="text-xs font-mono">{question.bnccCode}</Badge>}
            </div>
            <SheetTitle className="text-base font-semibold leading-tight flex items-center gap-2">
              Detalhes da Questão
            </SheetTitle>
          </SheetHeader>
        </div>

        {/* Content */}
        <div className="p-6 flex-1">

          {/* Base Text */}
          {question.baseText && (
            <div className="mb-6 p-4 rounded-lg bg-muted/50 border border-border/50 text-sm leading-relaxed italic text-muted-foreground">
              {question.baseText}
            </div>
          )}

          {/* Image */}
          {question.imageUrl && (
            <div className="mb-6 w-full flex justify-center">
              <img src={question.imageUrl} alt="Imagem da questão" className="max-w-full rounded-lg border border-border/50" />
            </div>
          )}

          {/* Question Body */}
          <div className="text-base leading-relaxed text-foreground mb-8 whitespace-pre-wrap font-medium">
            {question.body}
          </div>

          {/* Options */}
          {question.type === "multiple_choice" && question.options && question.options.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Alternativas</h4>
              {question.options.map((opt: QuestionOption) => (
                <div
                  key={opt.id}
                  className={`flex gap-3 p-3 rounded-lg border transition-colors ${opt.isCorrect
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100"
                    : "border-border bg-background text-foreground"
                    }`}
                >
                  <span className={`shrink-0 flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${opt.isCorrect ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                    }`}>
                    {opt.label}
                  </span>
                  <p className="text-sm pt-0.5 leading-relaxed">{opt.text}</p>
                </div>
              ))}
            </div>
          )}

          {/* Discursive */}
          {question.type === "discursive" && (
            <div className="mt-6 p-4 rounded-lg border border-dashed border-border bg-muted/30">
              <p className="text-sm text-muted-foreground text-center">Questão discursiva (Correção manual ou via IA na aplicação da prova).</p>
            </div>
          )}

        </div>

        {/* Footer Actions (Sticky) */}
        <div className="p-6 border-t border-border bg-background sticky bottom-0 z-10 flex items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            ID: <span className="font-mono">{question.id.slice(-8)}</span>
          </div>

          <div className="flex items-center gap-2">
            {isPublic ? (
              <Button onClick={() => { onOpenChange(false); if (onSaveToFolder) onSaveToFolder(question.id); }}>
                <Pin className="w-4 h-4 mr-2" /> Salvar no Meu Banco
              </Button>
            ) : (
              <>
                {onRemoveFromFolder && currentFolderId && (
                  <Button variant="outline" onClick={() => { onOpenChange(false); onRemoveFromFolder(question.id); }}>
                    <X className="w-4 h-4 mr-2" /> Remover
                  </Button>
                )}
                <Button onClick={() => router.push(`/questoes/novo?id=${question.id}&folderId=${currentFolderId}`)}>
                  <Edit2 className="w-4 h-4 mr-2" /> Editar
                </Button>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ── Main Page ────────────────────────────────────────────────

export default function QuestoesPage() {
  const router = useRouter();

  // ── States: Tabs & Folders ──
  const [activeTab, setActiveTab] = useState("meu-banco");
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  const [folders, setFolders] = useState<QuestionFolder[]>([]);
  const [foldersLoading, setFoldersLoading] = useState(true);

  // New folder creation state
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedColor, setSelectedColor] = useState(FOLDER_COLORS[0]);
  const newFolderRef = useRef<HTMLInputElement>(null);

  // ── States: Folder View (Questions) ──
  const [folderQuestions, setFolderQuestions] = useState<Question[]>([]);
  const [folderQuestionsLoading, setFolderQuestionsLoading] = useState(false);
  const [folderSearch, setFolderSearch] = useState("");
  const [folderDiscipline, setFolderDiscipline] = useState("Todas");
  const [folderType, setFolderType] = useState("Todos");
  const [folderDifficulty, setFolderDifficulty] = useState("Todos");

  // ── States: Biblioteca ──
  const [publicQuestions, setPublicQuestions] = useState<Question[]>([]);
  const [publicLoading, setPublicLoading] = useState(false);
  const [publicSearch, setPublicSearch] = useState("");
  const [publicDiscipline, setPublicDiscipline] = useState("Todas as disciplinas");
  const [publicSource, setPublicSource] = useState("Todos os concursos");

  // ── States: Modals & Sheets ──
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [questionToSave, setQuestionToSave] = useState<string | null>(null);
  const [selectedFolderToSave, setSelectedFolderToSave] = useState<string>("");

  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);

  // ── Effects ──

  const fetchFolders = useCallback(async () => {
    setFoldersLoading(true);
    try {
      const res = await fetch("/api/folders");
      if (res.ok) setFolders(await res.json());
    } finally {
      setFoldersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  useEffect(() => {
    if (creatingFolder) newFolderRef.current?.focus();
  }, [creatingFolder]);

  const fetchFolderQuestions = useCallback(async () => {
    if (!currentFolderId) return;
    setFolderQuestionsLoading(true);
    try {
      const params = new URLSearchParams();
      if (folderDiscipline !== "Todas") params.set("discipline", folderDiscipline);
      if (folderType !== "Todos") params.set("type", folderType);
      if (folderDifficulty !== "Todos") params.set("difficulty", folderDifficulty);
      if (folderSearch) params.set("search", folderSearch);

      const res = await fetch(`/api/folders/${currentFolderId}/questions?${params}`);
      if (res.ok) setFolderQuestions(await res.json());
    } finally {
      setFolderQuestionsLoading(false);
    }
  }, [currentFolderId, folderDiscipline, folderType, folderDifficulty, folderSearch]);

  useEffect(() => {
    if (activeTab === "meu-banco" && currentFolderId) {
      const t = setTimeout(fetchFolderQuestions, 300);
      return () => clearTimeout(t);
    }
  }, [activeTab, currentFolderId, fetchFolderQuestions]);

  const fetchPublicQuestions = useCallback(async () => {
    setPublicLoading(true);
    try {
      const params = new URLSearchParams();
      if (publicSearch) params.set("search", publicSearch);
      if (publicDiscipline !== "Todas as disciplinas") params.set("discipline", publicDiscipline);
      if (publicSource !== "Todos os concursos") params.set("source", publicSource);

      const res = await fetch(`/api/questions/public?${params}`);
      if (res.ok) setPublicQuestions(await res.json());
    } finally {
      setPublicLoading(false);
    }
  }, [publicSearch, publicDiscipline, publicSource]);

  useEffect(() => {
    if (activeTab === "acervo") {
      const t = setTimeout(fetchPublicQuestions, 300);
      return () => clearTimeout(t);
    }
  }, [activeTab, fetchPublicQuestions]);


  // ── Folder CRUD ──
  const createFolder = async (redirectAfter = false) => {
    if (!newFolderName.trim()) return null;
    const res = await fetch("/api/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newFolderName.trim(), color: selectedColor }),
    });
    if (res.ok) {
      const folder = await res.json();
      setFolders((prev) => [...prev, folder]);
      setNewFolderName("");
      setCreatingFolder(false);
      if (redirectAfter) setCurrentFolderId(folder.id);
      return folder.id;
    }
    return null;
  };

  const deleteFolder = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Excluir esta pasta? As questões não serão deletadas.")) return;
    const res = await fetch(`/api/folders/${id}`, { method: "DELETE" });
    if (res.ok || res.status === 204) {
      setFolders((prev) => prev.filter((f) => f.id !== id));
      if (currentFolderId === id) setCurrentFolderId(null);
    }
  };

  // ── Question Actions ──
  const removeFromFolder = async (questionId: string) => {
    if (!currentFolderId) return;
    await fetch(`/api/folders/${currentFolderId}/questions`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId }),
    });
    setFolderQuestions((prev) => prev.filter((q) => q.id !== questionId));
    fetchFolders();
  };

  const deleteQuestionPermanently = async (questionId: string) => {
    if (!confirm("Excluir esta questão permanentemente?")) return;
    await fetch(`/api/questions/${questionId}`, { method: "DELETE" });
    setFolderQuestions((prev) => prev.filter((q) => q.id !== questionId));
    fetchFolders();
  };

  const saveToFolder = async () => {
    if (!questionToSave || !selectedFolderToSave) return;

    await fetch(`/api/folders/${selectedFolderToSave}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: questionToSave }),
    });

    setSaveDialogOpen(false);
    setQuestionToSave(null);
    setSelectedFolderToSave("");
    fetchFolders(); // Update counts
  };

  const currentFolder = folders.find((f) => f.id === currentFolderId);

  return (
    <div className="w-full space-y-6">

      {/* ── Global Header ── */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {currentFolder ? (
            <>
              <Button variant="ghost" size="icon" onClick={() => setCurrentFolderId(null)} className="-ml-2">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex-1 max-w-[50vw]">
                <EditableTitle
                  value={currentFolder.name}
                  onValueChange={(val) => {
                    setFolders((prev) => prev.map((f) => (f.id === currentFolderId ? { ...f, name: val } : f)));
                  }}
                  placeholder="Nome da Pasta"
                  textClassName="text-2xl font-bold tracking-tight text-foreground"
                  className="-ml-2"
                />
              </div>
            </>
          ) : (
            <h1 className="text-2xl font-bold tracking-tight">Banco de questões</h1>
          )}
        </div>
        {!currentFolderId && activeTab === "meu-banco" && (
          <Button className="gap-2 shadow-sm" onClick={() => setCreatingFolder(true)}>
            <FolderPlus className="w-4 h-4" /> Nova Pasta
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        {/* Tabs Navigation */}
        <div className="border-b border-border mb-6 flex justify-between items-end">
          <TabsList className="bg-transparent p-0 h-auto gap-6 -mb-[1px]">
            <TabsTrigger
              value="meu-banco"
              onClick={() => {
                if (currentFolderId) setCurrentFolderId(null);
              }}
              className="px-0 py-3 rounded-none aria-selected:border-none aria-selected:outline-none aria-selected:ring-0 aria-selected:bg-transparent aria-selected:shadow-none text-muted-foreground aria-selected:text-foreground font-medium text-base transition-none"
            >
              <Library className="w-4 h-4 mr-2" />
              Meu banco
            </TabsTrigger>
            <TabsTrigger
              value="acervo"
              className="px-0 py-3 rounded-none aria-selected:border-none aria-selected:outline-none aria-selected:ring-0 aria-selected:bg-transparent aria-selected:shadow-none text-muted-foreground aria-selected:text-foreground font-medium text-base transition-none"
            >
              <Globe className="w-4 h-4 mr-2" />
              Biblioteca
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ── Tab Content: Meu Banco ── */}
        <TabsContent value="meu-banco" className="flex-1 flex flex-col m-0 border-none outline-none">



          {/* Root View (Folders Only) */}
          {!currentFolderId && (
            <div className="flex-1 overflow-y-auto">
              {foldersLoading ? (
                <div className="flex justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {folders.map((folder) => (
                    <div
                      key={folder.id}
                      onClick={() => setCurrentFolderId(folder.id)}
                      className="group flex flex-col bg-card border border-border rounded-xl p-4 cursor-pointer hover:border-primary/40 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-background border border-border shadow-sm">
                          <FolderIcon className="w-5 h-5" style={{ color: folder.color ?? "#6366f1" }} />
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger onClick={(e) => e.stopPropagation()} className="p-1.5 rounded-md hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={(e) => deleteFolder(e, folder.id)}>
                              <Trash2 className="w-4 h-4 mr-2" /> Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <h3 className="font-medium text-sm text-card-foreground line-clamp-1">{folder.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{folder.questionCount} {folder.questionCount === 1 ? 'questão' : 'questões'}</p>
                    </div>
                  ))}

                  {creatingFolder && (
                    <div className="col-span-full md:col-span-1 lg:col-span-1 flex flex-col bg-card border border-primary/40 rounded-xl p-4 shadow-sm h-full">
                      <div className="mb-3 flex justify-between">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-background border border-border">
                          <FolderIcon className="w-5 h-5" style={{ color: selectedColor }} />
                        </div>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setCreatingFolder(false)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <input
                        ref={newFolderRef}
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") createFolder();
                          if (e.key === "Escape") setCreatingFolder(false);
                        }}
                        placeholder="Nome da pasta..."
                        className="text-sm font-medium bg-transparent border-b border-primary outline-none py-1 mb-3"
                      />
                      <div className="flex gap-1 flex-wrap mb-3">
                        {FOLDER_COLORS.map((c) => (
                          <button
                            key={c}
                            onClick={() => setSelectedColor(c)}
                            className="w-4 h-4 rounded-full border-2 transition-all"
                            style={{ backgroundColor: c, borderColor: selectedColor === c ? "white" : "transparent", outline: selectedColor === c ? `1px solid ${c}` : "none" }}
                          />
                        ))}
                      </div>
                      <Button size="sm" className="h-7 text-xs w-full" onClick={() => createFolder()}>
                        Salvar Pasta
                      </Button>
                    </div>
                  )}

                  {!creatingFolder && folders.length === 0 && (
                    <div className="col-span-full py-24 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                        <FolderOpen className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium text-foreground mb-1">Seu banco está vazio</h3>
                      <p className="text-sm text-muted-foreground mb-4">Crie pastas para organizar suas questões de forma visual.</p>
                      <Button onClick={() => setCreatingFolder(true)} className="gap-2">
                        <FolderPlus className="w-4 h-4" /> Criar Primeira Pasta
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Folder View (Questions Only) */}
          {currentFolderId && (
            <div className="flex-1 overflow-y-auto pb-8">
              {folderQuestionsLoading ? (
                <div className="flex justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
              ) : folderQuestions.length === 0 ? (
                <div className="text-center py-24">
                  <Pin className="w-10 h-10 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="font-medium text-foreground mb-1">Nenhuma questão nesta pasta</h3>
                  <p className="text-sm text-muted-foreground mb-6">Salve questões do acervo ou crie novas para preencher esta pasta.</p>
                  <div className="flex gap-3 justify-center">
                    <Button variant="outline" onClick={() => setActiveTab("acervo")} className="gap-2">
                      <Globe className="w-4 h-4" /> Explorar biblioteca
                    </Button>
                    <Button onClick={() => router.push(`/questoes/novo?folderId=${currentFolderId}`)} className="gap-2">
                      <Plus className="w-4 h-4" /> Criar questão
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
                  {folderQuestions.map(q => (
                    <QuestionCard
                      key={q.id}
                      question={q}
                      onClick={() => { setSelectedQuestion(q); setIsDetailSheetOpen(true); }}
                      onRemoveFromFolder={removeFromFolder}
                      onDelete={deleteQuestionPermanently}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

        </TabsContent>

        {/* ── Tab Content: Biblioteca ── */}
        <TabsContent value="acervo" className="flex-1 flex flex-col m-0 border-none outline-none">

          {/* Search — full width, prominent */}
          <div className="relative w-full mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="search"
              value={publicSearch}
              onChange={(e) => setPublicSearch(e.target.value)}
              placeholder="Buscar por enunciado, palavra-chave, código BNCC..."
              className="w-full pl-12 pr-4 py-3 text-sm rounded-xl border border-input bg-card focus:outline-none focus:ring-2 focus:ring-ring shadow-sm"
            />
          </div>

          {/* Filters row */}
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <FilterChip
              label="Todos os concursos"
              value={publicSource}
              options={["Todos os concursos", "ENEM", "ENEM 2024", "ENEM 2023", "ENEM 2022", "Vestibular", "Concurso público", "Olimpíada"]}
              onChange={setPublicSource}
            />
            <FilterChip
              label="Todas as matérias"
              value={publicDiscipline}
              options={["Todas as disciplinas", "Matemática", "Física", "Química", "Biologia", "História", "Geografia", "Português", "Inglês", "Filosofia", "Sociologia"]}
              onChange={setPublicDiscipline}
            />
          </div>

          {/* Biblioteca — grouped by source (concurso) then discipline (matéria) */}
          <div className="flex-1 overflow-y-auto pb-8">
            {publicLoading ? (
              <div className="flex justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : publicQuestions.length === 0 ? (
              <div className="text-center py-24">
                <Globe className="w-10 h-10 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="font-medium text-foreground mb-1">Nenhuma questão encontrada</h3>
                <p className="text-sm text-muted-foreground">Tente ajustar os filtros ou buscar por outro termo.</p>
              </div>
            ) : (() => {
              // Group questions by source tag (concurso), then by discipline (matéria)
              const grouped: Record<string, Record<string, Question[]>> = {};
              publicQuestions.forEach(q => {
                const source = (Array.isArray(q.tags) && q.tags.length > 0 ? q.tags[0] : typeof q.tags === 'string' && q.tags ? q.tags : 'Outros');
                const disc = q.discipline || 'Sem matéria';
                if (!grouped[source]) grouped[source] = {};
                if (!grouped[source][disc]) grouped[source][disc] = [];
                grouped[source][disc].push(q);
              });

              return (
                <div className="space-y-8">
                  {Object.entries(grouped).map(([source, disciplines]) => (
                    <div key={source}>
                      <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {source}
                      </h3>
                      {Object.entries(disciplines).map(([disc, questions]) => (
                        <div key={disc} className="mb-6">
                          <h4 className="text-sm font-medium text-muted-foreground mb-3 pl-3.5">{disc}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
                            {questions.map(q => (
                              <QuestionCard
                                key={q.id}
                                question={q}
                                isPublic
                                onClick={() => { setSelectedQuestion(q); setIsDetailSheetOpen(true); }}
                                onSaveToFolder={(id) => {
                                  setQuestionToSave(id);
                                  setSaveDialogOpen(true);
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

        </TabsContent>

      </Tabs>

      {/* ── Detail Sheet ── */}
      <QuestionDetailSheet
        question={selectedQuestion}
        open={isDetailSheetOpen}
        onOpenChange={setIsDetailSheetOpen}
        currentFolderId={activeTab === "meu-banco" ? currentFolderId : null}
        isPublic={activeTab === "acervo"}
        onSaveToFolder={(id) => {
          setQuestionToSave(id);
          setSaveDialogOpen(true);
        }}
        onRemoveFromFolder={removeFromFolder}
      />

      {/* ── Save to Folder Dialog ── */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Salvar na Pasta</DialogTitle>
            <DialogDescription>
              Escolha uma pasta para guardar esta questão no seu banco pessoal.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {folders.length === 0 ? (
              <div className="text-center py-4 text-sm text-muted-foreground">
                Você ainda não tem pastas criadas.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2">
                {folders.map(f => (
                  <Button
                    key={f.id}
                    variant="outline"
                    onClick={() => setSelectedFolderToSave(f.id)}
                    className={`flex justify-start items-center gap-2 p-2.5 h-auto rounded-lg text-left transition-colors ${selectedFolderToSave === f.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50 text-foreground"
                      }`}
                  >
                    <FolderIcon className="w-4 h-4 shrink-0" style={{ color: f.color ?? "#6366f1" }} />
                    <span className="text-sm truncate font-medium">{f.name}</span>
                  </Button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 border-t pt-4">
              <input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Ou crie uma nova pasta..."
                className="flex-1 text-sm px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <Button
                variant="secondary"
                onClick={async () => {
                  const id = await createFolder(false);
                  if (id) setSelectedFolderToSave(id);
                }}
                disabled={!newFolderName.trim()}
              >
                Criar
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setSaveDialogOpen(false)}>Cancelar</Button>
            <Button onClick={saveToFolder} disabled={!selectedFolderToSave}>
              <Pin className="w-4 h-4 mr-2" /> Salvar Questão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

// Emulate Lucide icon that wasn't imported to avoid build fail (if missing)
function Plus(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}
