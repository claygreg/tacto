"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, BookPlus, Loader2, Check } from "lucide-react";

export default function AcervoPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("Todas");
  const [disciplineFilter, setDisciplineFilter] = useState("Todas as disciplinas");
  const [copiedIds, setCopiedIds] = useState<Record<string, boolean>>({});

  const sources = ["Todas", "ENEM 2024", "ENEM 2023", "ENEM 2022"];
  const disciplines = ["Todas as disciplinas", "Matemática", "Física", "Química", "Biologia", "Português", "História", "Geografia", "Estudos Gerais"];

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (sourceFilter !== "Todas") params.append("source", sourceFilter);
      if (disciplineFilter !== "Todas as disciplinas") params.append("discipline", disciplineFilter);

      const res = await fetch(`/api/questions/public?${params.toString()}`);
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

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQuestions();
    }, 300); // debounce
    return () => clearTimeout(timer);
  }, [search, sourceFilter, disciplineFilter]);

  const handleCopy = async (id: string) => {
    try {
      setCopiedIds(prev => ({ ...prev, [id]: true })); // show loading briefly if we wanted, but we'll just optimistically show success or handle it
      const res = await fetch(`/api/questions/public/${id}/copy`, { method: "POST" });
      if (res.ok) {
        setCopiedIds(prev => ({ ...prev, [id]: true })); // kept as true to show 'Copied'
      } else {
        setCopiedIds(prev => ({ ...prev, [id]: false }));
      }
    } catch (err) {
      console.error(err);
      setCopiedIds(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Acervo público</h1>
      </div>

      {/* Busca */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            id="input-public-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por enunciado, disciplina, tags..."
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select 
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {sources.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select 
          value={disciplineFilter}
          onChange={(e) => setDisciplineFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {disciplines.map((d) => <option key={d}>{d}</option>)}
        </select>
      </div>

      <div className="text-xs text-muted-foreground flex items-center justify-between">
        <span>Exibindo {questions.length} questões</span>
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {questions.length === 0 && !loading && (
          <div className="text-center py-10 text-muted-foreground bg-card border border-border rounded-xl">
            Nenhuma questão encontrada com os filtros atuais.
          </div>
        )}
        
        {questions.map((q) => {
          const tags = q.tags ? JSON.parse(q.tags) : [];
          return (
            <div key={q.id} className="bg-card border border-border rounded-xl p-5 hover:border-primary/40 transition-colors group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <Badge variant="outline" className="text-xs">{q.discipline}</Badge>
                    <Badge variant="outline" className="text-xs">{q.yearLevel}</Badge>
                    {tags.map((t: string) => (
                      <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                    ))}
                  </div>
                  {/* Se houver imagem no corpo, renderizamos usando markdown ou div simples, mas aqui exibiremos o texto puro seccionado para não quebrar o layout, ou completo. */}
                  <div className="text-sm text-card-foreground leading-relaxed line-clamp-3 whitespace-pre-wrap">
                    {q.body}
                  </div>
                </div>
                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <Button 
                    size="sm" 
                    variant={copiedIds[q.id] ? "default" : "outline"} 
                    className="gap-1.5 h-7 text-xs whitespace-nowrap" 
                    id={`btn-add-bank-${q.id}`}
                    onClick={() => handleCopy(q.id)}
                    disabled={copiedIds[q.id]}
                  >
                    {copiedIds[q.id] ? (
                      <>
                        <Check className="w-3 h-3" />
                        No Banco
                      </>
                    ) : (
                      <>
                        <BookPlus className="w-3 h-3" />
                        Banco pessoal
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
