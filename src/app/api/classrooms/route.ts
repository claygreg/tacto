import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/classrooms — listar turmas do usuário logado
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const classrooms = await prisma.classroom.findMany({
    where: { userId: session.user.id },
    include: {
      _count: {
        select: { students: true, assessments: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const result = classrooms.map((c) => ({
    id: c.id,
    name: c.name,
    year: c.year ? parseInt(c.year) : new Date().getFullYear(),
    subject: c.subject || "",
    studentCount: c._count.students,
    assessmentCount: c._count.assessments,
    archived: c.archived,
  }));

  return NextResponse.json(result);
}

// POST /api/classrooms — criar nova turma
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const { name, year, subject } = await req.json();

  if (!name) {
    return NextResponse.json({ message: "Nome é obrigatório" }, { status: 400 });
  }

  const classroom = await prisma.classroom.create({
    data: {
      name,
      year: year?.toString() || new Date().getFullYear().toString(),
      subject: subject || null,
      userId: session.user.id,
    },
  });

  return NextResponse.json(classroom, { status: 201 });
}
