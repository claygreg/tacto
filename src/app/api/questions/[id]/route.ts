import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/questions/[id] — buscar detalhes
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const question = await prisma.question.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: { options: true },
  });

  if (!question) {
    return NextResponse.json({ message: "Questão não encontrada" }, { status: 404 });
  }

  return NextResponse.json(question);
}

// PATCH /api/questions/[id] — editar
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const existing = await prisma.question.findFirst({
    where: { id: params.id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ message: "Questão não encontrada" }, { status: 404 });
  }

  const data = await req.json();

  // Tratamento de atualização de alternativas: deleta as atuais e recria
  // Para MVP é mais simples do que fazer upsert de cada uma.
  if (data.type === "multiple_choice" && data.options) {
    await prisma.questionOption.deleteMany({
      where: { questionId: params.id },
    });
  }

  const question = await prisma.question.update({
    where: { id: params.id },
    data: {
      type: data.type !== undefined ? data.type : undefined,
      body: data.body !== undefined ? data.body : undefined,
      baseText: data.baseText !== undefined ? data.baseText : undefined,
      discipline: data.discipline !== undefined ? data.discipline : undefined,
      tags: data.tags !== undefined ? JSON.stringify(data.tags) : undefined,
      bnccCode: data.bnccCode !== undefined ? data.bnccCode : undefined,
      yearLevel: data.yearLevel !== undefined ? data.yearLevel : undefined,
      difficulty: data.difficulty !== undefined ? data.difficulty : undefined,
      
      options: data.type === "multiple_choice" && data.options 
        ? {
            create: data.options.map((opt: any) => ({
              label: opt.label,
              text: opt.text,
              isCorrect: opt.isCorrect,
            }))
          }
        : undefined,
    },
    include: { options: true },
  });

  return NextResponse.json(question);
}

// DELETE /api/questions/[id] — excluir
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const existing = await prisma.question.findFirst({
    where: { id: params.id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ message: "Questão não encontrada" }, { status: 404 });
  }

  await prisma.question.delete({ where: { id: params.id } });
  return NextResponse.json({ message: "Questão excluída" });
}
