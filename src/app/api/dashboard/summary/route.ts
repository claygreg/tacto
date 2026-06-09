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

  const [classrooms, assessments, questions] = await Promise.all([
    prisma.classroom.findMany({ where: { userId } }),
    prisma.assessment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        classroom: true,
        _count: { select: { items: true } }
      }
    }),
    prisma.question.count({ where: { userId } }),
  ]);

  const activeClassrooms = classrooms.filter(c => !c.archived).length;
  const archivedClassrooms = classrooms.filter(c => c.archived).length;

  const appliedAssessments = assessments.filter(a => a.appliedAt).length;
  const pendingAssessments = assessments.filter(a => !a.appliedAt).length;

  const recentAssessments = assessments.slice(0, 3).map(a => ({
    id: a.id,
    name: a.name,
    classroomName: a.classroom.name,
    questionCount: a._count.items,
    status: a.appliedAt ? "applied" : (a._count.items > 0 ? "exported" : "draft")
  }));

  // Simular atividade recente básica
  const mockActivity = [
    { id: 1, type: "system", text: "Bem-vindo ao Tacto!", time: "Hoje" }
  ];

  return NextResponse.json({
    classroomCount: activeClassrooms,
    archivedClassrooms,
    assessmentCount: assessments.length,
    pendingAssessments,
    questionCount: questions,
    aiGeneratedQuestions: 0, // Poderia ser um count onde source = 'ai_generated'
    recentAssessments,
    mockActivity
  });
}
