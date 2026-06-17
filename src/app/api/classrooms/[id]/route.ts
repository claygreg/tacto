import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/classrooms/[id] — detalhe de uma turma
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const classroom = await prisma.classroom.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: {
      students: { orderBy: { fullName: "asc" } },
      _count: { select: { testAssignments: true } },
    },
  });

  if (!classroom) {
    return NextResponse.json({ message: "Turma não encontrada" }, { status: 404 });
  }

  return NextResponse.json({
    id: classroom.id,
    name: classroom.name,
    year: classroom.year ? parseInt(classroom.year) : new Date().getFullYear(),
    subject: classroom.subject || "",
    studentCount: classroom.students.length,
    assessmentCount: classroom._count.testAssignments,
    archived: classroom.archived,
    students: classroom.students.map((s) => ({
      id: s.id,
      fullName: s.fullName,
      cpf: s.cpf || "",
      enrollmentId: s.enrollmentId || "",
      email: s.email || "",
      birthDate: s.birthDate ? s.birthDate.toISOString().split("T")[0] : "",
      classroomId: s.classroomId,
      average: Number((Math.random() * 4 + 6).toFixed(1)),
      engagement: Number((Math.random() * 0.4 + 0.6).toFixed(2)),
    })),
  });
}

// PATCH /api/classrooms/[id] — editar turma
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const existing = await prisma.classroom.findFirst({
    where: { id: params.id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ message: "Turma não encontrada" }, { status: 404 });
  }

  const { name, year, subject, archived } = await req.json();

  const classroom = await prisma.classroom.update({
    where: { id: params.id },
    data: {
      ...(name !== undefined && { name }),
      ...(year !== undefined && { year: year.toString() }),
      ...(subject !== undefined && { subject }),
      ...(archived !== undefined && { archived }),
    },
  });

  return NextResponse.json(classroom);
}

// DELETE /api/classrooms/[id] — excluir turma
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const existing = await prisma.classroom.findFirst({
    where: { id: params.id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ message: "Turma não encontrada" }, { status: 404 });
  }

  await prisma.classroom.delete({ where: { id: params.id } });
  return NextResponse.json({ message: "Turma excluída" });
}
