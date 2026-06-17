"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FileText, Plus, Search, Calendar, FileType, Loader2, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Test {
  id: string;
  title: string;
  instructions: string | null;
  createdAt: string;
  _count: {
    questions: number;
  };
}

export default function ProvasPage() {
  const router = useRouter();
  const [tests, setTests] = React.useState<Test[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tests");
      if (res.ok) {
        const data = await res.json();
        setTests(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createTest = async () => {
    try {
      const res = await fetch("/api/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Nova Prova", instructions: "" })
      });
      if (res.ok) {
        const newTest = await res.json();
        router.push(`/provas/${newTest.id}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTest = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Tem certeza que deseja excluir esta prova?")) return;
    
    try {
      await fetch(`/api/tests/${id}`, { method: "DELETE" });
      setTests(tests.filter(t => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTests = tests.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Provas</h1>
        </div>
        <Button onClick={createTest} className="gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> Nova Prova
        </Button>
      </div>

      {/* Main Content */}
      <div className="w-full space-y-6">
          


          {/* Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredTests.length === 0 ? (
            <div className="text-center py-24 bg-card rounded-xl border border-dashed border-border">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">Nenhuma prova encontrada</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Você ainda não tem provas criadas ou sua busca não retornou resultados.
              </p>
              <Button onClick={createTest} variant="outline" className="gap-2">
                <Plus className="w-4 h-4" /> Criar Primeira Prova
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTests.map((test) => (
                <div 
                  key={test.id}
                  onClick={() => router.push(`/provas/${test.id}`)}
                  className="group flex flex-col bg-card border border-border rounded-xl p-5 cursor-pointer hover:border-primary/40 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <FileType className="w-5 h-5" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity -mr-2 -mt-2">
                          <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/provas/${test.id}`)}>
                          <Pencil className="w-4 h-4 mr-2" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={(e) => deleteTest(e, test.id)}>
                          <Trash2 className="w-4 h-4 mr-2" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <h3 className="font-semibold text-foreground line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                    {test.title}
                  </h3>
                  
                  <div className="mt-auto pt-4 space-y-2">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <FileText className="w-3.5 h-3.5 mr-1.5" />
                      {test._count?.questions || 0} {(test._count?.questions === 1) ? 'questão' : 'questões'}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 mr-1.5" />
                      Criado em {format(new Date(test.createdAt), "dd MMM yyyy", { locale: ptBR })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

      </div>
    </div>
  );
}
