"use client";

import * as React from "react";
import { Loader2, Save, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DigitalAnswerCardProps {
  assignmentId: string;
  student: any;
  testQuestions: any[]; // The questions in the test
  existingSubmission?: any; // The student's current submission if any
  onSuccess: () => void;
  onCancel: () => void;
}

export function DigitalAnswerCard({
  assignmentId,
  student,
  testQuestions,
  existingSubmission,
  onSuccess,
  onCancel
}: DigitalAnswerCardProps) {
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  // Local state for answers
  // Structure: { [questionId]: { selectedOption: string | null, manualScore: string | null } }
  const [answers, setAnswers] = React.useState<Record<string, { selectedOption: string | null, manualScore: string }>>({});

  // Initialize state with existing submission
  React.useEffect(() => {
    const initial: Record<string, { selectedOption: string | null, manualScore: string }> = {};
    
    testQuestions.forEach(tq => {
      const q = tq.question;
      const existingResult = existingSubmission?.results?.find((r: any) => r.questionId === q.id);
      
      initial[q.id] = {
        selectedOption: existingResult?.selectedOption || null,
        manualScore: existingResult?.manualScore !== undefined && existingResult?.manualScore !== null 
          ? String(existingResult.manualScore) 
          : ""
      };
    });

    setAnswers(initial);
  }, [testQuestions, existingSubmission]);

  const handleSelectOption = (questionId: string, optionLabel: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        selectedOption: prev[questionId].selectedOption === optionLabel ? null : optionLabel
      }
    }));
  };

  const handleManualScoreChange = (questionId: string, val: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        manualScore: val
      }
    }));
  };

  const handleSave = async () => {
    setError("");
    setSaving(true);

    try {
      // Format payload
      const payloadAnswers = Object.entries(answers).map(([qId, data]) => ({
        questionId: qId,
        selectedOption: data.selectedOption,
        manualScore: data.manualScore ? parseFloat(data.manualScore.replace(",", ".")) : null
      }));

      const res = await fetch(`/api/assignments/${assignmentId}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.id,
          answers: payloadAnswers
        })
      });

      if (!res.ok) {
        throw new Error("Falha ao salvar resultados.");
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-foreground mb-1">Cartão Resposta</h2>
        <p className="text-sm text-muted-foreground">Aluno(a): <span className="font-medium text-foreground">{student.fullName}</span></p>
      </div>

      {error && (
        <div className="mb-4 bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
          <XCircle className="w-4 h-4" /> {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-6 pr-2">
        {testQuestions.map((tq, index) => {
          const q = tq.question;
          const ans = answers[q.id] || { selectedOption: null, manualScore: "" };

          return (
            <div key={q.id} className="p-4 bg-card border border-border rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold text-sm">Questão {index + 1}</span>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Peso: {tq.weight}</span>
              </div>

              {q.type === "multiple_choice" && (
                <div className="flex gap-2 justify-center">
                  {['A', 'B', 'C', 'D', 'E'].map(label => {
                    const isSelected = ans.selectedOption === label;
                    return (
                      <button
                        key={label}
                        onClick={() => handleSelectOption(q.id, label)}
                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-colors ${
                          isSelected 
                            ? 'bg-primary border-primary text-primary-foreground' 
                            : 'border-border bg-background hover:border-primary/50 text-foreground'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}

              {q.type === "discursive" && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-muted-foreground font-medium">Nota atribuída (Numérica)</label>
                  <Input 
                    type="number" 
                    step="0.1" 
                    min="0" 
                    max={tq.weight}
                    placeholder={`Max: ${tq.weight}`}
                    value={ans.manualScore}
                    onChange={(e) => handleManualScoreChange(q.id, e.target.value)}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="pt-6 mt-4 border-t border-border flex justify-end gap-3">
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar Gabarito
        </Button>
      </div>
    </div>
  );
}
