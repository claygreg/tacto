import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Check, X } from "lucide-react";
import { mockStudentResults } from "@/lib/mock-data/diagnostics";
import { mockQuestions } from "@/lib/mock-data/questions";

// TODO: [API] GET /api/diagnostics/:assessmentId/:studentId
const student = mockStudentResults[0];
const questions = mockQuestions.slice(0, 5);

// Mock respostas do aluno
const mockAnswers = [
  { questionId: "q-1", studentAnswer: "B", correct: true },
  { questionId: "q-2", studentAnswer: "A", correct: true },
  { questionId: "q-3", studentAnswer: null, correct: false }, // discursiva
  { questionId: "q-4", studentAnswer: "D", correct: false },
  { questionId: "q-5", studentAnswer: "B", correct: true },
];

const skills = [
  { name: "Álgebra", mastered: true },
  { name: "Geometria", mastered: false },
  { name: "Estatística", mastered: true },
  { name: "Números", mastered: true },
  { name: "Probabilidade", mastered: false },
  { name: "Funções", mastered: false },
];

export default function DiagnosticoAlunoPage() {
  const pct = Math.round((student.correctCount / student.totalCount) * 100);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/diagnostico/asmnt-1">
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{student.studentName}</h1>
          </div>
        </div>
        {/* Nav entre alunos */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" id="btn-prev-student">
            <ChevronLeft className="w-3.5 h-3.5" />
            Anterior
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" id="btn-next-student">
            Próximo
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Resultado geral */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1 bg-card border border-border rounded-xl p-5 flex flex-col items-center justify-center text-center">
          <div className={`text-5xl font-extrabold mb-1 ${student.score >= 7 ? "text-green-400" : student.score >= 5 ? "text-amber-400" : "text-red-400"}`}>
            {student.score.toFixed(1)}
          </div>
          <div className="text-xs text-muted-foreground">Nota final</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 flex flex-col items-center justify-center text-center">
          <div className="text-4xl font-extrabold text-primary mb-1">{pct}%</div>
          <div className="text-xs text-muted-foreground">Acertos</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 flex flex-col items-center justify-center text-center">
          <div className="text-4xl font-extrabold text-foreground mb-1">{student.rank}°</div>
          <div className="text-xs text-muted-foreground">Posição na turma</div>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_280px] gap-6">
        {/* Questões */}
        <div className="bg-card border border-border rounded-xl">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-sm">Questão por questão</h2>
          </div>
          <div className="divide-y divide-border">
            {questions.map((q, i) => {
              const answer = mockAnswers.find((a) => a.questionId === q.id);
              const isCorrect = answer?.correct ?? false;
              return (
                <div key={q.id} className="p-4 flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${isCorrect ? "bg-green-500/15" : "bg-red-500/15"}`}>
                    {isCorrect ? (
                      <Check className="w-3.5 h-3.5 text-green-400" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-red-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold text-muted-foreground">Q{i + 1}</span>
                      <span className="text-xs text-muted-foreground">{q.discipline}</span>
                    </div>
                    <p className="text-sm text-card-foreground line-clamp-2 mb-1.5">{q.body}</p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-muted-foreground">
                        Marcou:{" "}
                        <span className={`font-mono font-bold ${isCorrect ? "text-green-400" : "text-red-400"}`}>
                          {answer?.studentAnswer ?? "—"}
                        </span>
                      </span>
                      {!isCorrect && q.options.length > 0 && (
                        <span className="text-muted-foreground">
                          Correta:{" "}
                          <span className="font-mono font-bold text-green-400">
                            {q.options.find((o) => o.isCorrect)?.label ?? "—"}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Habilidades BNCC */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="font-semibold text-sm mb-4">Mapa de Habilidades (BNCC)</h2>
            <div className="space-y-2">
              {skills.map((s) => (
                <div key={s.name} className="flex items-center justify-between">
                  <span className="text-sm text-card-foreground">{s.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    s.mastered
                      ? "bg-green-500/15 text-green-400"
                      : "bg-red-500/15 text-red-400"
                  }`}>
                    {s.mastered ? "Domina" : "Reforçar"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="font-semibold text-sm mb-3">Histórico na turma</h2>
            <div className="space-y-2">
              {[
                { name: "1º Bim", score: 6.5 },
                { name: "2º Bim", score: 9.5 },
              ].map((h) => (
                <div key={h.name} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{h.name}</span>
                  <span className={`font-bold ${h.score >= 7 ? "text-green-400" : "text-amber-400"}`}>
                    {h.score.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
