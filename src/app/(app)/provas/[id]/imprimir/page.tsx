"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Printer, Loader2 } from "lucide-react";
import Link from "next/link";

function shuffleArray<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export default function ImprimirProvaPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Estados locais para cabeçalho e configurações
  const [schoolName, setSchoolName] = useState("Escola Estadual Padrão");
  const [teacherName, setTeacherName] = useState("Professor(a)");
  const [versionsCount, setVersionsCount] = useState<number>(1);
  const [includeGabarito, setIncludeGabarito] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/assessments/${id}`);
      if (res.ok) {
        setAssessment(await res.json());
      }
    } catch (err) {
      console.error("Erro ao carregar", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Gera as versões embaralhadas usando useMemo para manter estabilidade enquanto digita no cabeçalho
  const generatedVersions = useMemo(() => {
    if (!assessment || !assessment.items) return [];

    const versions = [];
    const labels = ["A", "B", "C", "D", "E"];

    for (let i = 0; i < versionsCount; i++) {
      let currentItems = [...assessment.items];

      // Apenas embaralha questões se não for a versão A original
      if (i > 0) {
        currentItems = shuffleArray(currentItems);
      }

      // Prepara os itens e embaralha as alternativas se necessário
      const versionItems = currentItems.map((item) => {
        let options = item.question.options ? [...item.question.options] : [];
        if (i > 0 && item.question.type === "multiple_choice") {
          options = shuffleArray(options);
        }
        
        // Re-mapeia as letras das alternativas após o embaralhamento e encontra a correta
        let correctLabel = "";
        const formattedOptions = options.map((opt, idx) => {
          const newLabel = labels[idx];
          if (opt.isCorrect) correctLabel = newLabel;
          return { ...opt, displayLabel: newLabel };
        });

        return {
          ...item,
          question: {
            ...item.question,
            options: formattedOptions,
            correctLabel: correctLabel || null,
          },
        };
      });

      versions.push({
        type: labels[i],
        items: versionItems,
      });
    }

    return versions;
  }, [assessment, versionsCount]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!assessment) {
    return <div className="text-center py-20">Prova não encontrada.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Controles de Impressão (Ocultos ao imprimir) */}
      <div className="print:hidden bg-card border border-border p-6 rounded-xl space-y-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/provas/${id}`}>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">Configurar Impressão</h1>
              <p className="text-muted-foreground text-sm">Ajuste o cabeçalho e as versões antes de imprimir</p>
            </div>
          </div>
          <Button onClick={() => window.print()} className="gap-2">
            <Printer className="w-4 h-4" />
            Imprimir Agora (Ctrl + P)
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-border">
          <div className="col-span-2 md:col-span-1">
            <label className="text-sm font-medium block mb-1.5">Versões (Anti-fraude)</label>
            <select
              value={versionsCount}
              onChange={(e) => setVersionsCount(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value={1}>1 Versão (A)</option>
              <option value={2}>2 Versões (A e B)</option>
              <option value={3}>3 Versões (A, B e C)</option>
            </select>
          </div>
          <div className="col-span-2 md:col-span-1 flex items-end">
            <label className="flex items-center gap-2 text-sm font-medium p-2 border border-border rounded-lg w-full cursor-pointer hover:border-primary/40 transition-colors">
              <input
                type="checkbox"
                checked={includeGabarito}
                onChange={(e) => setIncludeGabarito(e.target.checked)}
                className="w-4 h-4 rounded text-primary"
              />
              Incluir Gabarito
            </label>
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="text-sm font-medium block mb-1.5">Nome da Escola</label>
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="text-sm font-medium block mb-1.5">Nome do Professor</label>
            <input
              type="text"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </div>

      {/* ÁREA DE IMPRESSÃO (Folha A4) */}
      <div className="print:m-0 print:p-0 print:w-full space-y-10">
        {generatedVersions.map((version, vIndex) => (
          <div 
            key={`version-${version.type}`} 
            className="bg-white text-black p-10 min-h-[297mm] mx-auto shadow-md rounded border border-gray-200 print:shadow-none print:border-none"
            style={{ pageBreakAfter: "always" }}
          >
            {/* Cabeçalho da Prova */}
            <div className="border border-black p-4 mb-6 relative">
              {versionsCount > 1 && (
                <div className="absolute top-0 right-0 bg-black text-white px-3 py-1 font-bold text-lg rounded-bl-lg">
                  TIPO {version.type}
                </div>
              )}
              <div className="text-center font-bold text-lg uppercase mb-3 border-b border-black pb-2 mr-16">
                {schoolName}
              </div>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-3">
                <div><strong>Aluno(a):</strong> _______________________________________________________</div>
                <div><strong>Nº:</strong> _______ <strong>Turma:</strong> {assessment.classroomName}</div>
                <div><strong>Professor(a):</strong> {teacherName}</div>
                <div><strong>Data:</strong> ____/____/_______</div>
              </div>
              
              <div className="border-t border-black pt-2 flex justify-between text-sm">
                <div><strong>Avaliação:</strong> {assessment.name}</div>
                <div><strong>Disciplina:</strong> {assessment.subject || "________________"}</div>
                <div><strong>Nota:</strong> _______</div>
              </div>
            </div>

            {/* Questões */}
            <div className="space-y-8">
              {version.items.length === 0 ? (
                <div className="text-center italic text-gray-500 py-10">
                  Nenhuma questão adicionada a esta avaliação.
                </div>
              ) : (
                version.items.map((item: any, idx: number) => (
                  <div key={item.id} className="text-sm">
                    <div className="flex gap-2">
                      <span className="font-bold">{idx + 1}.</span>
                      <div className="flex-1">
                        {/* Texto base, se houver */}
                        {item.question.baseText && (
                          <p className="mb-2 italic text-gray-700 text-justify">
                            {item.question.baseText}
                          </p>
                        )}
                        
                        {/* Enunciado */}
                        <p className="mb-3 text-justify whitespace-pre-wrap">{item.question.body}</p>
                        
                        {/* Alternativas ou espaço para discursiva */}
                        {item.question.type === "multiple_choice" ? (
                          <div className="space-y-2 pl-2 mt-3">
                            {item.question.options.map((opt: any) => (
                              <div key={opt.id} className="flex gap-2 items-start">
                                <span>({opt.displayLabel})</span>
                                <span>{opt.text}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="mt-4 space-y-6">
                            <div className="border-b border-gray-400"></div>
                            <div className="border-b border-gray-400"></div>
                            <div className="border-b border-gray-400"></div>
                            <div className="border-b border-gray-400"></div>
                            <div className="border-b border-gray-400"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Rodapé Fim da Prova */}
            {version.items.length > 0 && (
              <div className="text-center mt-12 text-sm italic">
                Boa Sorte!
              </div>
            )}
          </div>
        ))}

        {/* GABARITO (Última Página) */}
        {includeGabarito && generatedVersions[0]?.items?.length > 0 && (
          <div className="bg-white text-black p-10 min-h-[297mm] mx-auto shadow-md rounded border border-gray-200 print:shadow-none print:border-none">
            <div className="text-center font-bold text-2xl uppercase mb-10 border-b-2 border-black pb-4">
              Gabarito do Professor
            </div>
            
            <div className="flex flex-wrap gap-12 justify-center">
              {generatedVersions.map((version) => (
                <div key={`gabarito-${version.type}`} className="border border-black p-6 rounded min-w-[250px]">
                  <h3 className="font-bold text-xl text-center mb-6 border-b border-black pb-2">
                    {versionsCount > 1 ? `Prova Tipo ${version.type}` : "Gabarito"}
                  </h3>
                  
                  <div className="space-y-3 text-lg">
                    {version.items.map((item: any, idx: number) => (
                      <div key={`gab-${item.id}`} className="flex items-center gap-4">
                        <span className="font-bold w-8 text-right">{idx + 1}.</span>
                        <span>
                          {item.question.type === "multiple_choice" 
                            ? <span className="font-bold px-2 py-1 bg-gray-200 rounded">{item.question.correctLabel}</span>
                            : <span className="italic text-sm text-gray-500">Discursiva (Correção Manual)</span>
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
