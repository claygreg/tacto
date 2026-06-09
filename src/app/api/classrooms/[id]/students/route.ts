import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/classrooms/[id]/students — listar alunos da turma
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  // Verifica se a turma pertence ao usuário
  const classroom = await prisma.classroom.findFirst({
    where: { id: params.id, userId: session.user.id },
  });

  if (!classroom) {
    return NextResponse.json({ message: "Turma não encontrada" }, { status: 404 });
  }

  const students = await prisma.student.findMany({
    where: { classroomId: params.id },
    orderBy: { fullName: "asc" },
  });

  return NextResponse.json(
    students.map((s) => ({
      id: s.id,
      fullName: s.fullName,
      email: s.email || "",
      birthDate: s.birthDate ? s.birthDate.toISOString().split("T")[0] : "",
      classroomId: s.classroomId,
    }))
  );
}

// POST /api/classrooms/[id]/students — adicionar aluno
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
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

  if (!fullName) {
    return NextResponse.json({ message: "Nome é obrigatório" }, { status: 400 });
  }

  const student = await prisma.student.create({
    data: {
      fullName,
      email: email || null,
      birthDate: birthDate ? new Date(birthDate) : null,
      classroomId: params.id,
    },
  });

  return NextResponse.json(
    {
      id: student.id,
      fullName: student.fullName,
      email: student.email || "",
      birthDate: student.birthDate ? student.birthDate.toISOString().split("T")[0] : "",
      classroomId: student.classroomId,
    },
    { status: 201 }
  );
}
