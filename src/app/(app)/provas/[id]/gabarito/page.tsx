"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, CheckCircle2 } from "lucide-react";
import { mockStudents } from "@/lib/mock-data/students";
import { mockQuestions } from "@/lib/mock-data/questions";

const questions = mockQuestions.slice(0, 5);
const students = mockStudents.slice(0, 8);
const options = ["A", "B", "C", "D", "E"];

export default function TabulacaoPage() {
  const [responses, setResponses] = React.useState<Record<string, Record<string, string>>>({});
  const [versions, setVersions] = React.useState<Record<string, "A" | "B">>(
    Object.fromEntries(students.map((s) => [s.id, "A"]))
  );

  const setResponse = (studentId: string, questionId: string, option: string) => {
    setResponses((prev) => ({
      ...prev,
      [studentId]: { ...(prev[studentId] || {}), [questionId]: option },
    }));
  };

  const filled = students.filter((s) => {
    const r = responses[s.id] || {};
    return questions.every((q) => r[q.id]);
  }).length;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/provas">
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tabulação de gabaritos</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {filled}/{students.length} alunos completos
          </span>
          {/* TODO: [API] POST /api/assessments/:id/responses/confirm */}
          <Link href="/diagnostico/asmnt-1">
            <Button className="gap-2" id="btn-confirm-tabulation" disabled={filled === 0}>
              <CheckCircle2 className="w-4 h-4" />
              Calcular Diagnóstico
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-card border border-border rounded-xl overflow-auto">
        <table className="w-full min-w-max">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-48">
                Aluno
              </th>
              <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-20">
                Versão
              </th>
              {questions.map((q, i) => (
                <th key={q.id} className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center w-20">
                  Q{i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {students.map((student) => {
              const studentResponses = responses[student.id] || {};
              const allFilled = questions.every((q) => studentResponses[q.id]);
              return (
                <tr key={student.id} className={`hover:bg-muted/20 transition-colors ${allFilled ? "bg-green-500/3" : ""}`}>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {allFilled && <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />}
                      <div>
                        <p className="text-sm font-medium">{student.fullName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <select
                      value={versions[student.id]}
                      onChange={(e) =>
                        setVersions((prev) => ({ ...prev, [student.id]: e.target.value as "A" | "B" }))
                      }
                      className="text-xs px-2 py-1 rounded border border-input bg-background text-foreground focus:outline-none"
                    >
                      <option value="A">Tipo A</option>
                      <option value="B">Tipo B</option>
                    </select>
                  </td>
                  {questions.map((q) => {
                    const selected = studentResponses[q.id];
                    return (
                      <td key={q.id} className="p-4 text-center">
                        <div className="flex gap-1 justify-center">
                          {options.map((opt) => (
                            <Button
                              key={opt}
                              variant={selected === opt ? "default" : "ghost"}
                              size="icon"
                              onClick={() => setResponse(student.id, q.id, opt)}
                              className="w-6 h-6 rounded text-xs font-mono font-bold transition-colors border"
                            >
                              {opt}
                            </Button>
                          ))}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
