import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const { id } = params;

  // 1. Encontrar a questão pública original
  const publicQuestion = await prisma.question.findUnique({
    where: { id },
    include: { options: true },
  });

  if (!publicQuestion) {
    return NextResponse.json({ message: "Questão não encontrada" }, { status: 404 });
  }

  if (publicQuestion.source !== "public") {
    return NextResponse.json({ message: "Esta questão não é pública" }, { status: 400 });
  }

  // 2. Criar a cópia como pessoal
  const newQuestion = await prisma.question.create({
    data: {
      type: publicQuestion.type,
      body: publicQuestion.body,
      baseText: publicQuestion.baseText,
      discipline: publicQuestion.discipline,
      tags: publicQuestion.tags,
      bnccCode: publicQuestion.bnccCode,
      yearLevel: publicQuestion.yearLevel,
      difficulty: publicQuestion.difficulty,
      source: "personal",
      userId: session.user.id,
      options: {
        create: publicQuestion.options.map(opt => ({
          label: opt.label,
          text: opt.text,
          isCorrect: opt.isCorrect,
        })),
      },
    },
  });

  return NextResponse.json(newQuestion, { status: 201 });
}
