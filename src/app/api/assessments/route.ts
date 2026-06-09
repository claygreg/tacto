import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/assessments — listar provas do usuário logado
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const assessments = await prisma.assessment.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      classroom: {
        select: { name: true, subject: true, year: true },
      },
      _count: {
        select: { items: true, responses: true },
      },
    },
  });

  return NextResponse.json(
    assessments.map((a) => ({
      id: a.id,
      name: a.name,
      classroomId: a.classroomId,
      classroomName: a.classroom.name,
      status: a.appliedAt ? "applied" : a.items.length > 0 ? "exported" : "draft",
      createdAt: a.createdAt.toISOString(),
      appliedAt: a.appliedAt ? a.appliedAt.toISOString() : null,
      questionCount: a._count.items,
      totalPoints: a._count.items * 1, // Por padrão peso 1, depois podemos somar os pesos reais
      versions: 1, // MVP
    }))
  );
}

// POST /api/assessments — criar nova prova
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const { name, classroomId } = await req.json();

  if (!name || !classroomId) {
    return NextResponse.json({ message: "Nome e turma são obrigatórios" }, { status: 400 });
  }

  // Verifica se a turma existe e pertence ao usuário
  const classroom = await prisma.classroom.findFirst({
    where: { id: classroomId, userId: session.user.id },
  });

  if (!classroom) {
    return NextResponse.json({ message: "Turma não encontrada" }, { status: 404 });
  }

  const assessment = await prisma.assessment.create({
    data: {
      name,
      classroomId,
      userId: session.user.id,
    },
  });

  return NextResponse.json(assessment, { status: 201 });
}
