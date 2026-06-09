import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/assessments/[id]/responses - Retorna alunos e respostas atuais para a grid de tabulação
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const assessment = await prisma.assessment.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: {
      classroom: {
        include: {
          students: {
            orderBy: { name: "asc" },
          },
        },
      },
      items: {
        orderBy: { order: "asc" },
        include: {
          question: {
            include: { options: true },
          },
        },
      },
    },
  });

  if (!assessment) {
    return NextResponse.json({ message: "Prova não encontrada" }, { status: 404 });
  }

  // Buscar respostas existentes
  const responses = await prisma.assessmentResponse.findMany({
    where: { assessmentId: params.id },
    include: {
      items: true,
    },
  });

  return NextResponse.json({
    students: assessment.classroom.students,
    items: assessment.items.map((item) => ({
      id: item.id,
      order: item.order,
      weight: item.weight,
      options: item.question.options.map(opt => ({
        id: opt.id,
        label: opt.label,
        isCorrect: opt.isCorrect,
      })),
    })),
    responses: responses.map((r) => ({
      studentId: r.studentId,
      version: r.version,
      totalScore: r.totalScore,
      items: r.items.map((ri) => ({
        assessmentItemId: ri.assessmentItemId,
        selectedOption: ri.selectedOption,
      })),
    })),
  });
}

// POST /api/assessments/[id]/responses - Salvar e corrigir gabaritos em massa
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  // data = array de { studentId, items: { [assessmentItemId]: "A" | "B" | null } }
  const data = await req.json();

  const assessment = await prisma.assessment.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: {
      items: {
        include: { question: { include: { options: true } } },
      },
    },
  });

  if (!assessment) {
    return NextResponse.json({ message: "Prova não encontrada" }, { status: 404 });
  }

  // Mapear opções corretas
  const correctOptionsMap: Record<string, string | null> = {};
  const weightMap: Record<string, number> = {};
  for (const item of assessment.items) {
    const correctOpt = item.question.options.find(o => o.isCorrect);
    correctOptionsMap[item.id] = correctOpt ? correctOpt.label : null;
    weightMap[item.id] = item.weight;
  }

  // Transação para salvar tudo com segurança
  await prisma.$transaction(async (tx) => {
    // Para cada aluno enviado na grid
    for (const studentData of data) {
      if (!studentData.studentId) continue;

      let totalScore = 0;

      // Calcular acertos antes de inserir
      const responseItemsData = [];
      for (const [itemId, selectedLabel] of Object.entries(studentData.items || {})) {
        if (!selectedLabel) continue; // Pulo vazio

        const correctLabel = correctOptionsMap[itemId];
        const isCorrect = selectedLabel === correctLabel;
        const scoreObtained = isCorrect ? (weightMap[itemId] || 1) : 0;
        totalScore += scoreObtained;

        responseItemsData.push({
          assessmentItemId: itemId,
          selectedOption: String(selectedLabel),
          isCorrect,
          scoreObtained,
        });
      }

      // Deletar resposta anterior se existir (sobrescreve grid)
      await tx.assessmentResponse.deleteMany({
        where: { assessmentId: params.id, studentId: studentData.studentId },
      });

      // Se o professor não preencheu nenhuma questão para esse aluno, não criamos registro
      if (responseItemsData.length > 0) {
        await tx.assessmentResponse.create({
          data: {
            assessmentId: params.id,
            studentId: studentData.studentId,
            version: "A", // Futuramente suportaremos "B", "C" para embaralhamento
            totalScore,
            appliedAt: new Date(),
            items: {
              create: responseItemsData,
            },
          },
        });
      }
    }

    // Atualizar status da avaliação como "aplicada"
    await tx.assessment.update({
      where: { id: params.id },
      data: { appliedAt: new Date() },
    });
  });

  return NextResponse.json({ message: "Gabaritos salvos e corrigidos com sucesso" });
}
