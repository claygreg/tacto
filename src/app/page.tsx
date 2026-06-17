import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Sparkles,
  FileDown,
  BarChart3,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-16 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
            <GraduationCap className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg tracking-tight">Tacto</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Entrar</Button>
          </Link>
          <Link href="/cadastro">
            <Button size="sm">Comece grátis</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-8 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-muted text-muted-foreground text-sm font-medium mb-8">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            IA integrada para professores
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight leading-tight mb-6">
            Avaliações pedagógicas{" "}
            <span className="text-primary">de alto impacto</span>,<br />
            em minutos
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            O Tacto ajuda professores a criar provas com IA, exportar para
            impressão e gerar diagnósticos automáticos por turma e por aluno.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link href="/cadastro">
              <Button size="lg" className="gap-2">
                Criar conta gratuita
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg">
                Ver demonstração
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="py-20 px-8 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            Três passos. Resultado real.
          </h2>
          <p className="text-muted-foreground text-center mb-14">
            Do zero ao diagnóstico completo sem complicações.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: Sparkles,
                title: "Cria",
                desc: "Gere questões com IA em segundos ou monte manualmente. Organize por disciplina e habilidade BNCC.",
              },
              {
                step: "02",
                icon: FileDown,
                title: "Aplica",
                desc: "Exporte em PDF ou DOCX com gabarito e versões anti-fraude. Aplique normalmente em papel.",
              },
              {
                step: "03",
                icon: BarChart3,
                title: "Diagnostica",
                desc: "Registre os gabaritos e receba dashboards de desempenho por turma e por aluno.",
              },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div
                key={step}
                className="relative p-6 rounded-2xl border border-border bg-card"
              >
                <span className="absolute top-4 right-4 text-5xl font-extrabold text-muted/30 select-none">
                  {step}
                </span>
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            Tudo que o professor precisa
          </h2>
          <p className="text-muted-foreground text-center mb-14">
            Um produto construído de ponta a ponta para o fluxo real de avaliação pedagógica.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {[
              "Geração de questões com IA (GPT-4o ou Gemini)",
              "Editor rich text para customização pedagógica",
              "Banco pessoal de questões por disciplina",
              "Acervo público com filtros BNCC",
              "Exportação em PDF e DOCX com cabeçalho institucional",
              "Versões anti-fraude com gabarito espelho",
              "Tabulação ágil de gabaritos por turma",
              "Dashboard de desempenho com heatmap de habilidades",
              "Perfil individual de cada aluno",
              "Histórico bimestral de evolução",
              "Envio automático de feedback por e-mail",
              "Importação de lista de chamada via CSV",
            ].map((feature) => (
              <div key={feature} className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span className="text-sm text-card-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 px-8 bg-muted/30">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para transformar suas avaliações?
          </h2>
          <p className="text-muted-foreground mb-8">
            Comece gratuitamente. Sem cartão de crédito.
          </p>
          <Link href="/cadastro">
            <Button size="lg" className="gap-2">
              Criar conta gratuita
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-8 border-t border-border">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            <span className="font-semibold text-foreground">Tacto</span>
          </div>
          <span>© 2026 Tacto. Plataforma de Avaliações Pedagógicas.</span>
        </div>
      </footer>
    </div>
  );
}
