import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const { discipline, yearLevel, topic, type, difficulty } = await req.json();

  if (!topic) {
    return NextResponse.json({ message: "Tema é obrigatório" }, { status: 400 });
  }

  // Fallback caso não tenha chave do Gemini configurada no ambiente
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.warn("GOOGLE_GENERATIVE_AI_API_KEY não definida. Retornando mock de IA.");
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return NextResponse.json({
      type,
      discipline,
      yearLevel,
      baseText: "Este é um texto-base gerado automaticamente porque a chave da API do Gemini não está configurada no seu arquivo .env.",
      body: `Você pediu uma questão de ${discipline} sobre "${topic}" para o nível ${yearLevel} com dificuldade ${difficulty}. Qual das alternativas abaixo está correta?`,
      explanation: "Explicação mockada devido à ausência de chave de API.",
      options: type === "multiple_choice" ? [
        { label: "A", text: "Alternativa incorreta 1", isCorrect: false },
        { label: "B", text: "Alternativa incorreta 2", isCorrect: false },
        { label: "C", text: "Esta é a alternativa correta", isCorrect: true },
        { label: "D", text: "Alternativa incorreta 3", isCorrect: false },
        { label: "E", text: "Alternativa incorreta 4", isCorrect: false },
      ] : undefined,
    });
  }

  // Se tiver a chave, chama a API de verdade
  try {
    const prompt = `Crie uma questão de ${discipline} para estudantes do ${yearLevel}.
O tema da questão é: "${topic}".
Nível de dificuldade: ${difficulty}.
Tipo da questão: ${type === "multiple_choice" ? "Múltipla Escolha (com 5 alternativas de A a E)" : "Discursiva"}.

Regras:
1. Siga o estilo de questões do ENEM ou vestibulares tradicionais brasileiros, quando aplicável.
2. Certifique-se de que há APENAS UMA alternativa correta caso seja múltipla escolha.
3. Se fizer sentido para a disciplina, inclua um pequeno texto-base.
4. Forneça uma explicação pedagógica clara sobre a resposta correta.`;

    const { object } = await generateObject({
      model: google("gemini-3.1-flash-lite"),
      maxRetries: 0,
      schema: z.object({
        baseText: z.string().optional().describe("Texto de apoio ou contexto (omitir se não for necessário)"),
        body: z.string().describe("Enunciado da questão (a pergunta em si)"),
        explanation: z.string().describe("Explicação da resposta correta e/ou comentários sobre a questão"),
        options: z.array(z.object({
          label: z.string().describe("Deve ser exatamente A, B, C, D ou E em maiúsculo"),
          text: z.string(),
          isCorrect: z.boolean(),
        })).optional().describe("Array com 5 alternativas. Obrigatório para múltipla escolha. Omitir se discursiva."),
      }),
      prompt,
    });

    return NextResponse.json({ ...object, type, discipline, yearLevel });
  } catch (err: any) {
    console.error("Erro na API da IA:", err);

    let errorMessage = err?.message || String(err);
    // Extrai mensagem útil se for erro de validação de schema da Vercel AI
    if (err.name === "TypeValidationError" && err.value) {
      errorMessage = `Erro de validação: O formato gerado pela IA foi inválido.`;
    }

    return NextResponse.json({
      message: "Erro ao gerar questão com a IA",
      details: errorMessage
    }, { status: 500 });
  }
}
