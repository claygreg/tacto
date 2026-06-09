import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { assessmentId: string; studentId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  // Verificar se o professor é dono da prova
  const assessment = await prisma.assessment.findFirst({
    where: { id: params.assessmentId, userId: session.user.id },
    include: {
      items: {
        orderBy: { order: "asc" },
        include: { question: { include: { options: true } } },
      },
    },
  });

  if (!assessment) {
    return NextResponse.json({ message: "Prova não encontrada" }, { status: 404 });
  }

  const student = await prisma.student.findUnique({
    where: { id: params.studentId },
  });

  if (!student) {
    return NextResponse.json({ message: "Aluno não encontrado" }, { status: 404 });
  }

  const response = await prisma.assessmentResponse.findFirst({
    where: { assessmentId: params.assessmentId, studentId: params.studentId },
    include: { items: true },
  });

  if (!response) {
    return NextResponse.json({ message: "Aluno não realizou esta prova" }, { status: 404 });
  }

  const totalScore = response.totalScore || 0;
  const maxPossibleScore = assessment.items.reduce((acc, item) => acc + item.weight, 0);

  // Mapear itens da prova para o detalhamento e calcular performance por disciplina
  const disciplineStatsMap: Record<string, { total: number; correct: number }> = {};
  
  const itemsDetails = assessment.items.map((item, index) => {
    const responseItem = response.items.find(ri => ri.assessmentItemId === item.id);
    const correctOption = item.question.options.find(o => o.isCorrect)?.label;
    const selectedOption = responseItem?.selectedOption || null;
    const isCorrect = responseItem?.isCorrect || false;

    // Agrupar por disciplina
    const disc = item.question.discipline || "Geral";
    if (!disciplineStatsMap[disc]) {
      disciplineStatsMap[disc] = { total: 0, correct: 0 };
    }
    disciplineStatsMap[disc].total++;
    if (isCorrect) disciplineStatsMap[disc].correct++;

    return {
      order: index + 1,
      discipline: disc,
      bncc: item.question.bnccCode,
      correctOption,
      selectedOption,
      isCorrect,
      scoreObtained: responseItem?.scoreObtained || 0,
      weight: item.weight,
    };
  });

  const performanceByDiscipline = Object.entries(disciplineStatsMap).map(([name, stats]) => ({
    name,
    hitRate: stats.correct / stats.total,
    correct: stats.correct,
    total: stats.total,
  }));

  return NextResponse.json({
    studentName: student.fullName,
    totalScore,
    maxPossibleScore,
    performanceByDiscipline,
    itemsDetails,
  });
}
