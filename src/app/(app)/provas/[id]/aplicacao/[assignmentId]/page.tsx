"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, CheckCircle2, Circle, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { DigitalAnswerCard } from "@/components/features/DigitalAnswerCard";
import Link from "next/link";

export default function LançamentoNotasPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.id as string;
  const assignmentId = params.assignmentId as string;

  const [assignment, setAssignment] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  
  const [activeStudent, setActiveStudent] = React.useState<any>(null);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  const fetchAssignment = async () => {
    try {
      const res = await fetch(`/api/assignments/${assignmentId}`);
      if (res.ok) {
        const data = await res.json();
        setAssignment(data);
      } else {
        router.push(`/provas/${testId}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAssignment();
  }, [assignmentId]);

  const handleOpenCard = (student: any) => {
    setActiveStudent(student);
    setIsSheetOpen(true);
  };

  const handleSuccess = () => {
    setIsSheetOpen(false);
    setActiveStudent(null);
    fetchAssignment(); // Refresh data to show new scores
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!assignment) return null;

  const maxScore = assignment.test.questions.reduce((acc: number, tq: any) => acc + tq.weight, 0);

  return (
    <div className="w-full space-y-6">
      
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/provas/${testId}`}>
          <Button variant="ghost" size="icon" className="w-8 h-8 bg-background border shadow-sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lançamento de resultados</h1>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{assignment.submissions.length} <span className="text-sm font-normal text-muted-foreground">/ {assignment.classroom.students.length}</span></p>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Provas Corrigidas</p>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{maxScore}</p>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Pontos Totais (Peso)</p>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Aluno(a)</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Nota Obtida</th>
                <th className="px-6 py-4 font-medium text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {assignment.classroom.students.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                    Nenhum aluno cadastrado nesta turma.
                  </td>
                </tr>
              ) : (
                assignment.classroom.students.map((student: any) => {
                  const submission = assignment.submissions.find((s: any) => s.studentId === student.id);
                  const isDone = !!submission;

                  return (
                    <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">{student.fullName}</td>
                      <td className="px-6 py-4">
                        {isDone ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Corrigida
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 border border-amber-500/20">
                            <Circle className="w-3.5 h-3.5" /> Pendente
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono">
                        {isDone ? (
                          <span className="font-bold">{submission.totalScore} <span className="text-muted-foreground font-sans text-xs font-normal">/ {maxScore}</span></span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          variant={isDone ? "outline" : "default"} 
                          size="sm"
                          onClick={() => handleOpenCard(student)}
                        >
                          {isDone ? "Revisar" : "Lançar Gabarito"}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Answer Card Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="w-[90vw] sm:max-w-md overflow-hidden flex flex-col p-6">
          {activeStudent && (
            <DigitalAnswerCard 
              assignmentId={assignmentId}
              student={activeStudent}
              testQuestions={assignment.test.questions}
              existingSubmission={assignment.submissions.find((s: any) => s.studentId === activeStudent.id)}
              onSuccess={handleSuccess}
              onCancel={() => setIsSheetOpen(false)}
            />
          )}
        </SheetContent>
      </Sheet>

    </div>
  );
}
