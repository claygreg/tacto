"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mail, ChevronLeft, Loader2, Users } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { DiagnosticSummary, GradeRange, StudentResult } from "@/types";
import { PIE_CHART_PALETTE } from "@/lib/constants";
import { BreadcrumbSetter } from "@/components/ui/breadcrumb-setter";



export default function DiagnosticoTurmaPage({ params }: { params: { provaId: string } }) {
  const [data, setData] = useState<DiagnosticSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Array<{ id: string; fullName: string; totalScore: number | null }>>([]);

  useEffect(() => {
    // Buscar diagnóstico
    fetch(`/api/diagnostics/${params.provaId}`)
      .then(res => res.json())
      .then(json => setData(json))
      .catch(console.error);

    // Buscar lista de alunos da prova
    fetch(`/api/assessments/${params.provaId}/responses`)
      .then(res => res.json())
      .then(json => {
        if (json.students) {
          // Unir dados de responses (notas) com students
          const studentScores = json.students.map((s: any) => {
            const resp = json.responses?.find((r: any) => r.studentId === s.id);
            return {
              ...s,
              totalScore: resp ? resp.totalScore : null,
            };
          });
          setStudents(studentScores);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.provaId]);

  if (loading) {
    return <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;
  }

  if (!data || data.totalStudents === 0) {
    return <div className="p-10 text-center">Nenhum dado encontrado para esta prova.</div>;
  }

  return (
    <div className="w-full space-y-6 pb-20">
      {data?.assessmentName && <BreadcrumbSetter segment={params.provaId} label={data.assessmentName} />}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/provas">
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{data.assessmentName}</h1>
          </div>
        </div>
        {/* TODO: [API] POST /api/emails/send-feedback */}
        <Button className="gap-2" id="btn-send-feedback">
          <Mail className="w-4 h-4" />
          Enviar Feedback por E-mail
        </Button>
      </div>

      {data.average === 0 && data.highest === 0 && data.lowest === 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-4 mb-6">
          Aviso: Nenhuma tabulação foi lançada ainda para esta turma. <Link href={`/provas/${params.provaId}/tabulacao`} className="font-bold underline">Clique aqui para tabular os gabaritos.</Link>
        </div>
      )}

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Média geral", value: data.average.toFixed(1), color: "text-primary" },
          { label: "Maior nota", value: data.highest.toFixed(1), color: "text-green-400" },
          { label: "Menor nota", value: data.lowest.toFixed(1), color: "text-red-400" },
          { label: "Mediana", value: data.median.toFixed(1), color: "text-amber-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4 text-center">
            <div className={`text-3xl font-extrabold ${color} mb-1`}>{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-6">
        {/* Gráfico de barras — acerto por questão */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold mb-4 text-sm">% de acerto por questão</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.questionStats} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
              <YAxis
                tickFormatter={(v) => `${Math.round(v * 100)}%`}
                domain={[0, 1]}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              />
              <Tooltip
                formatter={(v) => [`${Math.round(Number(v) * 100)}%`, "Acerto"]}
                labelFormatter={(l) => `Questão ${l}`}
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }}
              />
              <Bar dataKey="correctRate" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de pizza — distribuição de notas */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold mb-4 text-sm">Distribuição de notas</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data.gradeDistribution}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {data.gradeDistribution.map((entry: GradeRange, index: number) => (
                  <Cell key={`cell-${index}`} fill={PIE_CHART_PALETTE[index % PIE_CHART_PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }}
                itemStyle={{ color: "var(--foreground)", fontSize: 13 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {data.gradeDistribution.map((entry: GradeRange, index: number) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_CHART_PALETTE[index % PIE_CHART_PALETTE.length] }} />
                {entry.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de Alunos e Relatório Individual */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Relatório Individual</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {students.map((student) => (
            <Link key={student.id} href={`/diagnostico/${params.provaId}/aluno/${student.id}`}>
              <div className="p-3 border border-border rounded-lg hover:border-primary/50 hover:bg-muted/30 transition-colors flex justify-between items-center cursor-pointer">
                <span className="font-medium text-sm">{student.fullName}</span>
                {student.totalScore !== null ? (
                  <span className="text-sm font-bold text-primary">{student.totalScore.toFixed(1)}</span>
                ) : (
                  <span className="text-xs text-muted-foreground">Pendente</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
