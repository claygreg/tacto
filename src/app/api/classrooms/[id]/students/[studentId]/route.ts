import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/classrooms/[id]/students/[studentId] — editar aluno
export async function PATCH(
  req: Request,
  { params }: { params: { id: string; studentId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const classroom = await prisma.classroom.findFirst({
    where: { id: params.id, userId: session.user.id },
  });
  if (!classroom) {
    return NextResponse.json({ message: "Turma não encontrada" }, { status: 404 });
  }

  const { fullName, email, birthDate } = await req.json();

  const student = await prisma.student.update({
    where: { id: params.studentId },
    data: {
      ...(fullName !== undefined && { fullName }),
      ...(email !== undefined && { email: email || null }),
      ...(birthDate !== undefined && { birthDate: birthDate ? new Date(birthDate) : null }),
    },
  });

  return NextResponse.json({
    id: student.id,
    fullName: student.fullName,
    email: student.email || "",
    birthDate: student.birthDate ? student.birthDate.toISOString().split("T")[0] : "",
    classroomId: student.classroomId,
  });
}

// DELETE /api/classrooms/[id]/students/[studentId] — excluir aluno
export async function DELETE(
  req: Request,
  { params }: { params: { id: string; studentId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const classroom = await prisma.classroom.findFirst({
    where: { id: params.id, userId: session.user.id },
  });
  if (!classroom) {
    return NextResponse.json({ message: "Turma não encontrada" }, { status: 404 });
  }

  await prisma.student.delete({ where: { id: params.studentId } });
  return NextResponse.json({ message: "Aluno excluído" });
}
