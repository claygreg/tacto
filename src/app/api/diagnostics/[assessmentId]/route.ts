import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { assessmentId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const assessment = await prisma.assessment.findFirst({
    where: { id: params.assessmentId, userId: session.user.id },
    include: {
      classroom: {
        include: { _count: { select: { students: true } } },
      },
      items: {
        orderBy: { order: "asc" },
        include: { question: true },
      },
      responses: {
        include: { items: true },
      },
    },
  });

  if (!assessment) {
    return NextResponse.json({ message: "Prova não encontrada" }, { status: 404 });
  }

  const responses = assessment.responses;
  const totalStudents = assessment.classroom._count.students;

  if (responses.length === 0) {
    return NextResponse.json({
      assessmentName: assessment.name,
      classroomName: assessment.classroom.name,
      appliedAt: assessment.appliedAt ? assessment.appliedAt.toISOString() : null,
      totalStudents,
      average: 0,
      highest: 0,
      lowest: 0,
      median: 0,
      questionStats: [],
      gradeDistribution: [],
    });
  }

  // 1. Calculando métricas gerais (notas)
  const scores = responses.map(r => r.totalScore || 0).sort((a, b) => a - b);
  const highest = scores[scores.length - 1];
  const lowest = scores[0];
  const average = scores.reduce((acc, s) => acc + s, 0) / scores.length;
  
  let median = 0;
  const mid = Math.floor(scores.length / 2);
  if (scores.length % 2 === 0) {
    median = (scores[mid - 1] + scores[mid]) / 2;
  } else {
    median = scores[mid];
  }

  // 2. Calculando % de acerto por questão
  const questionStats = assessment.items.map((item, index) => {
    // Quantos alunos acertaram essa questão?
    const correctCount = responses.filter(r => {
      const responseItem = r.items.find(ri => ri.assessmentItemId === item.id);
      return responseItem?.isCorrect;
    }).length;

    const correctRate = correctCount / responses.length;

    return {
      label: (index + 1).toString(), // "1", "2", "3"
      correctRate: correctRate,
    };
  });

  // 3. Distribuição de notas (agrupando por faixas: 0-2, 2-4, 4-6, 6-8, 8-10)
  // Assumindo que a nota máxima teórica seria a soma dos pesos, mas vamos usar faixas percentuais
  const maxPossibleScore = assessment.items.reduce((acc, item) => acc + item.weight, 0) || 10;
  
  const distribution = {
    "Abaixo de 50%": 0,
    "50% a 70%": 0,
    "70% a 90%": 0,
    "Acima de 90%": 0,
  };

  scores.forEach(score => {
    const percent = score / maxPossibleScore;
    if (percent < 0.5) distribution["Abaixo de 50%"]++;
    else if (percent < 0.7) distribution["50% a 70%"]++;
    else if (percent < 0.9) distribution["70% a 90%"]++;
    else distribution["Acima de 90%"]++;
  });

  const gradeDistribution = Object.entries(distribution)
    .filter(([_, count]) => count > 0)
    .map(([name, value]) => ({ name, value }));

  return NextResponse.json({
    assessmentName: assessment.name,
    classroomName: assessment.classroom.name,
    appliedAt: assessment.appliedAt ? assessment.appliedAt.toISOString() : null,
    totalStudents,
    average,
    highest,
    lowest,
    median,
    questionStats,
    gradeDistribution,
  });
}
