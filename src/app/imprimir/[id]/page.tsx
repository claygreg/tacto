"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Loader2, Printer, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ImprimirProvaPage() {
  const params = useParams();
  const testId = params.id as string;

  const [test, setTest] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [showGabarito, setShowGabarito] = React.useState(false);

  React.useEffect(() => {
    async function fetchTest() {
      try {
        const res = await fetch(`/api/tests/${testId}`);
        if (res.ok) {
          const data = await res.json();
          setTest(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchTest();
  }, [testId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p>Prova não encontrada.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 p-8 print:p-0 print:bg-white text-black font-sans">
      
      {/* ── Controls (Hidden in Print) ── */}
      <div className="max-w-4xl mx-auto mb-8 flex justify-end gap-4 print:hidden">
        <Button 
          variant={showGabarito ? "default" : "outline"} 
          onClick={() => setShowGabarito(!showGabarito)}
          className="gap-2 bg-white text-black hover:bg-neutral-100"
        >
          <CheckSquare className="w-4 h-4" /> 
          {showGabarito ? "Ocultar Gabarito" : "Mostrar Gabarito"}
        </Button>
        <Button onClick={() => window.print()} className="gap-2">
          <Printer className="w-4 h-4" /> Imprimir
        </Button>
      </div>

      {/* ── A4 Sheet (Printable Area) ── */}
      <div className="max-w-4xl mx-auto bg-white shadow-xl print:shadow-none print:max-w-full p-12 print:p-0">
        
        {/* Document Header */}
        <div className="border-2 border-black p-4 mb-8">
          <h1 className="text-2xl font-bold uppercase text-center mb-4">{test.title}</h1>
          <div className="grid grid-cols-2 gap-4 text-sm font-semibold">
            <div className="border-b border-black pb-1">Nome:</div>
            <div className="border-b border-black pb-1 flex gap-4">
               <span>Turma:</span>
               <span className="flex-1"></span>
               <span>Data: ____/____/________</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        {test.instructions && (
          <div className="mb-8 p-4 border border-black/50 text-sm">
            <p className="font-bold mb-2 uppercase text-xs">Instruções:</p>
            <div className="whitespace-pre-wrap">{test.instructions}</div>
          </div>
        )}

        {/* Questions */}
        <div className="space-y-10">
          {test.questions?.map((tq: any, index: number) => {
            const q = tq.question;
            return (
              <div key={tq.id} className="break-inside-avoid">
                <div className="flex gap-3 text-base">
                  <span className="font-bold">{index + 1}.</span>
                  <div className="flex-1">
                    {/* Base Text */}
                    {q.baseText && (
                      <div className="mb-4 text-sm italic border-l-2 border-neutral-300 pl-4 py-1 text-neutral-700">
                        {q.baseText}
                      </div>
                    )}

                    {/* Enunciado */}
                    <div 
                      className="prose prose-neutral max-w-none text-black font-medium mb-4" 
                      dangerouslySetInnerHTML={{ __html: q.body }} 
                    />

                    {/* Alternatives */}
                    {q.type === "multiple_choice" && q.options && (
                      <div className="space-y-3 mt-4">
                        {q.options.map((opt: any) => {
                          const isCorrect = showGabarito && opt.isCorrect;
                          return (
                            <div key={opt.id} className="flex gap-3 text-sm">
                              <span className={`font-bold ${isCorrect ? 'text-white bg-black px-1.5 rounded' : ''}`}>
                                {opt.label})
                              </span>
                              <div 
                                className={`${isCorrect ? 'font-bold underline' : ''}`}
                                dangerouslySetInnerHTML={{ __html: opt.text }} 
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Discursive Space */}
                    {q.type === "discursive" && (
                      <div className="mt-8 space-y-6">
                        <div className="border-b border-black/20 w-full"></div>
                        <div className="border-b border-black/20 w-full"></div>
                        <div className="border-b border-black/20 w-full"></div>
                        <div className="border-b border-black/20 w-full"></div>
                        <div className="border-b border-black/20 w-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* ── Styles for Print ── */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          @page {
            margin: 2cm;
          }
        }
      `}} />
    </div>
  );
}
