"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Save, Loader2 } from "lucide-react";

export default function TabulacaoPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [grid, setGrid] = useState<Record<string, Record<string, string>>>({}); // { studentId: { itemId: "A" } }

  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    fetch(`/api/assessments/${params.id}/responses`)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        // Pre-fill grid with existing responses
        const initialGrid: any = {};
        json.students?.forEach((s: any) => {
          initialGrid[s.id] = {};
        });
        json.responses?.forEach((r: any) => {
          if (initialGrid[r.studentId]) {
            r.items.forEach((item: any) => {
              initialGrid[r.studentId][item.assessmentItemId] = item.selectedOption;
            });
          }
        });
        setGrid(initialGrid);
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleInputChange = (studentId: string, itemId: string, value: string) => {
    const val = value.toUpperCase().replace(/[^A-E]/g, ""); // Apenas A, B, C, D, E (limitar a 1 caractere no maxLength)
    
    setGrid((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [itemId]: val,
      },
    }));

    // Auto-advance
    if (val.length === 1) {
      const studentIndex = data.students.findIndex((s: any) => s.id === studentId);
      const itemIndex = data.items.findIndex((i: any) => i.id === itemId);
      
      // Mover para o próximo item (próxima coluna)
      if (itemIndex < data.items.length - 1) {
        const nextItemId = data.items[itemIndex + 1].id;
        inputRefs.current[`${studentId}-${nextItemId}`]?.focus();
      } 
      // Se acabou a linha, ir para o primeiro item do próximo aluno
      else if (studentIndex < data.students.length - 1) {
        const nextStudentId = data.students[studentIndex + 1].id;
        const firstItemId = data.items[0].id;
        inputRefs.current[`${nextStudentId}-${firstItemId}`]?.focus();
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Transformar grid em array esperado pela API
      const payload = Object.entries(grid).map(([studentId, items]) => ({
        studentId,
        items, // { [itemId]: "A" }
      }));

      const res = await fetch(`/api/assessments/${params.id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push(`/diagnostico/${params.id}`);
      } else {
        alert("Erro ao salvar tabulação.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro de conexão.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/provas">
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Tabulação de Gabaritos</h1>
            <p className="text-muted-foreground text-sm">
              Digite as respostas (A, B, C, D, E). O avanço entre as células é automático.
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar e Corrigir
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="p-3 font-semibold text-muted-foreground whitespace-nowrap min-w-[200px] sticky left-0 bg-muted/90 backdrop-blur z-10">Aluno</th>
              {data.items.map((item: any, i: number) => (
                <th key={item.id} className="p-3 font-semibold text-center w-12 border-l border-border/50">
                  Q{i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.students.map((student: any) => (
              <tr key={student.id} className="hover:bg-muted/30">
                <td className="p-3 font-medium whitespace-nowrap sticky left-0 bg-card z-10">{student.name}</td>
                {data.items.map((item: any) => (
                  <td key={item.id} className="p-1 border-l border-border/50 text-center">
                    <input
                      ref={(el) => { inputRefs.current[`${student.id}-${item.id}`] = el; }}
                      type="text"
                      maxLength={1}
                      value={grid[student.id]?.[item.id] || ""}
                      onChange={(e) => handleInputChange(student.id, item.id, e.target.value)}
                      className="w-10 h-10 text-center uppercase font-bold bg-transparent border-0 focus:ring-2 focus:ring-primary focus:bg-background rounded-md outline-none transition-colors"
                      placeholder="-"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
