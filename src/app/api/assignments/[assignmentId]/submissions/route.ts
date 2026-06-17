import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { assignmentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { studentId, answers } = await request.json();

    if (!studentId || !answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }

    // Verify assignment exists
    const assignment = await prisma.testAssignment.findUnique({
      where: { id: params.assignmentId },
      include: {
        test: {
          include: {
            questions: {
              include: {
                question: {
                  include: {
                    options: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!assignment) {
      return NextResponse.json({ error: "Aplicação não encontrada." }, { status: 404 });
    }

    // Calculate scores
    let totalScore = 0;
    const resultsData = [];

    for (const testQuestion of assignment.test.questions) {
      const q = testQuestion.question;
      const answer = answers.find(a => a.questionId === q.id);
      
      let isCorrect = null;
      let scoreObtained = 0;
      const selectedOption = answer?.selectedOption || null;
      const manualScore = answer?.manualScore || null;

      if (answer) {
        if (q.type === "multiple_choice") {
          const correctOption = q.options.find(o => o.isCorrect);
          isCorrect = correctOption && correctOption.label === selectedOption;
          scoreObtained = isCorrect ? testQuestion.weight : 0;
        } else if (q.type === "discursive") {
          scoreObtained = manualScore || 0;
        }
      }

      totalScore += scoreObtained;

      resultsData.push({
        questionId: q.id,
        selectedOption,
        isCorrect,
        scoreObtained,
        manualScore
      });
    }

    // Upsert submission
    // First, check if submission exists
    const existingSubmission = await prisma.studentSubmission.findFirst({
      where: {
        testAssignmentId: params.assignmentId,
        studentId: studentId
      }
    });

    let submission;

    if (existingSubmission) {
      // Delete old results first
      await prisma.questionResult.deleteMany({
        where: { studentSubmissionId: existingSubmission.id }
      });

      // Update submission and add new results
      submission = await prisma.studentSubmission.update({
        where: { id: existingSubmission.id },
        data: {
          totalScore,
          appliedAt: new Date(),
          results: {
            create: resultsData
          }
        },
        include: { results: true }
      });
    } else {
      submission = await prisma.studentSubmission.create({
        data: {
          testAssignmentId: params.assignmentId,
          studentId,
          totalScore,
          appliedAt: new Date(),
          results: {
            create: resultsData
          }
        },
        include: { results: true }
      });
    }

    return NextResponse.json(submission);
  } catch (error) {
    console.error("POST /api/assignments/[id]/submissions Error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
