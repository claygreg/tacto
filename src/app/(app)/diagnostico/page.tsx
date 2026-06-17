import { Button } from "@/components/ui/button";
import { ChartColumn } from "lucide-react";
import Link from "next/link";

export default function DiagnosticoPage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in-95 duration-500">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <ChartColumn className="h-10 w-10 text-primary" />
      </div>
      <h2 className="mb-2 text-2xl font-semibold tracking-tight">
        Diagnósticos vem aí
      </h2>
      <p className="mb-8 max-w-[420px] text-muted-foreground">
        Em breve, você terá um painel completo para analisar o desempenho e descobrir exatamente onde focar. Estamos cuidando dos últimos detalhes.
      </p>
      <Button asChild variant="default">
        <Link href="/">Voltar para o início</Link>
      </Button>
    </div>
  );
}
