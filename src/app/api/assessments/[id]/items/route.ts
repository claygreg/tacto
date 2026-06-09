import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/assessments/[id]/items — adicionar questão à prova
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const assessment = await prisma.assessment.findFirst({
    where: { id: params.id, userId: session.user.id },
  });

  if (!assessment) {
    return NextResponse.json({ message: "Prova não encontrada" }, { status: 404 });
  }

  const { questionId } = await req.json();

  if (!questionId) {
    return NextResponse.json({ message: "ID da questão é obrigatório" }, { status: 400 });
  }

  // Define a ordem como a última
  const lastItem = await prisma.assessmentItem.findFirst({
    where: { assessmentId: params.id },
    orderBy: { order: "desc" },
  });

  const nextOrder = lastItem ? lastItem.order + 1 : 1;

  const item = await prisma.assessmentItem.create({
    data: {
      assessmentId: params.id,
      questionId,
      order: nextOrder,
      weight: 1.0,
    },
    include: {
      question: true,
    },
  });

  return NextResponse.json(item, { status: 201 });
}

// DELETE /api/assessments/[id]/items?itemId=xxx — remover questão da prova
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get("itemId");

  if (!itemId) {
    return NextResponse.json({ message: "ID do item é obrigatório" }, { status: 400 });
  }

  const assessment = await prisma.assessment.findFirst({
    where: { id: params.id, userId: session.user.id },
  });

  if (!assessment) {
    return NextResponse.json({ message: "Prova não encontrada" }, { status: 404 });
  }

  await prisma.assessmentItem.delete({
    where: { id: itemId },
  });

  return NextResponse.json({ message: "Item removido" });
}

// PATCH /api/assessments/[id]/items — atualizar ordem e pesos
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const assessment = await prisma.assessment.findFirst({
    where: { id: params.id, userId: session.user.id },
  });

  if (!assessment) {
    return NextResponse.json({ message: "Prova não encontrada" }, { status: 404 });
  }

  const { items } = await req.json(); // Array de { id, order, weight }

  if (!Array.isArray(items)) {
    return NextResponse.json({ message: "Formato inválido" }, { status: 400 });
  }

  // Como o Prisma não tem bulk update com valores diferentes, fazemos em transação
  const updates = items.map((item: any) =>
    prisma.assessmentItem.update({
      where: { id: item.id },
      data: {
        order: item.order,
        weight: item.weight,
      },
    })
  );

  await prisma.$transaction(updates);

  return NextResponse.json({ message: "Itens atualizados com sucesso" });
}
