"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function StudentDiagnosticPage({ params }: { params: { provaId: string; studentId: string } }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/diagnostics/${params.provaId}/students/${params.studentId}`)
      .then(res => res.json())
      .then(json => setData(json))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.provaId, params.studentId]);

  if (loading) {
    return <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;
  }

  if (!data || !data.studentName) {
    return <div className="p-10 text-center">Relatório não encontrado.</div>;
  }

  const gradePercent = data.maxPossibleScore > 0 ? (data.totalScore / data.maxPossibleScore) * 100 : 0;
  let gradeColor = "text-red-500";
  if (gradePercent >= 70) gradeColor = "text-green-500";
  else if (gradePercent >= 50) gradeColor = "text-amber-500";

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href={`/diagnostico/${params.provaId}`}>
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">Relatório Individual</h1>
          <p className="text-muted-foreground text-sm">Desempenho detalhado do aluno</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Info Card */}
        <div className="bg-card border border-border rounded-xl p-6 flex-1 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{data.studentName}</h2>
            <p className="text-muted-foreground text-sm mt-1">Nota final</p>
          </div>
          <div className={`text-4xl font-extrabold ${gradeColor}`}>
            {data.totalScore.toFixed(1)} <span className="text-xl text-muted-foreground font-medium">/ {data.maxPossibleScore}</span>
          </div>
        </div>

        {/* Resumo Disciplinas */}
        <div className="bg-card border border-border rounded-xl p-6 flex-[2]">
          <h3 className="font-semibold text-sm mb-4">Desempenho por Área</h3>
          <div className="space-y-3">
            {data.performanceByDiscipline.map((disc: any) => {
              const pct = Math.round(disc.hitRate * 100);
              return (
                <div key={disc.name} className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium truncate" title={disc.name}>{disc.name}</div>
                  <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${pct >= 70 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} 
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="w-16 text-right text-xs text-muted-foreground">
                    {disc.correct}/{disc.total} ({pct}%)
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabela de Itens */}
      <div className="bg-card border border-border rounded-xl overflow-hidden mt-6">
        <div className="p-4 border-b border-border bg-muted/20">
          <h2 className="font-semibold text-sm">Detalhamento das Questões</h2>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 font-medium text-muted-foreground w-12 text-center">Nº</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Disciplina / BNCC</th>
              <th className="px-4 py-3 font-medium text-muted-foreground text-center">Correta</th>
              <th className="px-4 py-3 font-medium text-muted-foreground text-center">Marcada</th>
              <th className="px-4 py-3 font-medium text-muted-foreground w-16 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.itemsDetails.map((item: any) => (
              <tr key={item.order} className="hover:bg-muted/30">
                <td className="px-4 py-3 text-center font-medium">{item.order}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{item.discipline}</span>
                    {item.bncc && <Badge variant="outline" className="text-[10px] py-0">{item.bncc}</Badge>}
                  </div>
                </td>
                <td className="px-4 py-3 text-center font-bold text-green-600">{item.correctOption}</td>
                <td className={`px-4 py-3 text-center font-bold ${item.isCorrect ? "text-green-600" : "text-red-500"}`}>
                  {item.selectedOption || "-"}
                </td>
                <td className="px-4 py-3 text-center">
                  {item.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
