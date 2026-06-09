"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Users,
  FileText,
  BarChart3,
  BookOpen,
  Plus,
  ArrowRight,
  Clock,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { useSession } from "next-auth/react";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/summary")
      .then(res => res.json())
      .then(json => setData(json))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;
  }

  const currentDate = new Date().toLocaleDateString("pt-BR", {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">Olá, {session?.user?.name?.split(' ')[0] || 'Professor'} 👋</h1>
        <p className="text-muted-foreground text-sm mt-1 capitalize">
          {currentDate}
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Turmas ativas",
            value: data.classroomCount,
            icon: Users,
            href: "/turmas",
            sub: `${data.archivedClassrooms} arquivada(s)`,
          },
          {
            label: "Provas criadas",
            value: data.assessmentCount,
            icon: FileText,
            href: "/provas",
            sub: `${data.pendingAssessments} aguardando aplicação`,
          },
          {
            label: "Questões no banco",
            value: data.questionCount,
            icon: BookOpen,
            href: "/questoes",
            sub: `${data.aiGeneratedQuestions} geradas com IA`,
          },
        ].map(({ label, value, icon: Icon, href, sub }) => (
          <Link key={label} href={href}>
            <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors group cursor-pointer h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="text-3xl font-bold mb-1">{value}</div>
              <div className="text-sm font-medium text-card-foreground">{label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex items-center gap-3">
        <Link href="/provas/nova">
          <Button className="gap-2" id="btn-create-assessment">
            <Plus className="w-4 h-4" />
            Nova Prova
          </Button>
        </Link>
        <Link href="/questoes/novo">
          <Button variant="outline" className="gap-2" id="btn-create-question">
            <Plus className="w-4 h-4" />
            Nova Questão
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-6">
        {/* Provas recentes */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Provas recentes</h2>
            <Link href="/provas" className="text-xs text-primary hover:underline">
              Ver todas
            </Link>
          </div>
          <div className="space-y-3">
            {data.recentAssessments.length === 0 ? (
              <div className="text-sm text-muted-foreground py-4">Nenhuma prova criada ainda.</div>
            ) : (
              data.recentAssessments.map((a: any) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors"
                >
                  <div className="min-w-0">
                    <Link href={`/provas/${a.id}`}>
                      <div className="text-sm font-medium truncate hover:text-primary transition-colors cursor-pointer">{a.name}</div>
                    </Link>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {a.classroomName} · {a.questionCount} questões
                    </div>
                  </div>
                  <span
                    className={`shrink-0 ml-3 text-xs px-2 py-0.5 rounded-full font-medium ${
                      a.status === "applied"
                        ? "bg-green-500/15 text-green-400"
                        : a.status === "exported"
                        ? "bg-blue-500/15 text-blue-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {a.status === "applied"
                      ? "Aplicada"
                      : a.status === "exported"
                      ? "Exportada"
                      : "Rascunho"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Atividade recente */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Atividade recente</h2>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            {data.mockActivity.map((item: any) => (
              <div key={item.id} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm text-card-foreground leading-snug">{item.text}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
