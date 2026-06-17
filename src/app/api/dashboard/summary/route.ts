import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const userId = session.user.id;

  const [classrooms, tests, questions] = await Promise.all([
    prisma.classroom.findMany({ where: { userId } }),
    prisma.test.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { questions: true } },
        assignments: true,
      }
    }),
    prisma.question.count({ where: { userId } }),
  ]);

  const activeClassrooms = classrooms.filter(c => !c.archived).length;
  const archivedClassrooms = classrooms.filter(c => c.archived).length;

  const appliedAssessments = tests.filter(t => t.assignments.some(a => a.appliedAt)).length;
  const pendingAssessments = tests.length - appliedAssessments;

  const recentAssessments = tests.slice(0, 3).map(t => ({
    id: t.id,
    name: t.title,
    classroomName: t.assignments.length > 0 ? "Aplicada em " + t.assignments.length + " turmas" : "Não aplicada",
    questionCount: t._count.questions,
    status: t.assignments.some(a => a.appliedAt) ? "applied" : (t._count.questions > 0 ? "exported" : "draft")
  }));

  // Simular atividade recente básica
  const mockActivity = [
    { id: 1, type: "system", text: "Bem-vindo ao Tacto!", time: "Hoje" }
  ];

  return NextResponse.json({
    classroomCount: activeClassrooms,
    archivedClassrooms,
    assessmentCount: tests.length,
    pendingAssessments,
    questionCount: questions,
    aiGeneratedQuestions: 0,
    recentAssessments,
    mockActivity
  });
}
