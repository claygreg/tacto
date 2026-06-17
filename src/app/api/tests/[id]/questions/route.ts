import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Add a question (or multiple) to a test
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const testId = params.id;
    const body = await request.json();
    const { questionId, questionIds } = body;

    // Verify test ownership
    const test = await prisma.test.findUnique({
      where: { id: testId },
      select: { userId: true }
    });

    if (!test || test.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    // Determine current max order
    const maxOrderRes = await prisma.testQuestion.aggregate({
      where: { testId },
      _max: { order: true }
    });
    
    let currentOrder = (maxOrderRes._max.order ?? -1) + 1;

    // Handle single or multiple question additions
    const idsToAdd = questionIds || (questionId ? [questionId] : []);

    if (idsToAdd.length === 0) {
      return NextResponse.json({ error: "No question ID provided" }, { status: 400 });
    }

    const newTestQuestions = [];

    // Ideally use transaction, but this is simple enough
    for (const qId of idsToAdd) {
      // Check if it's already in the test to avoid duplicates
      const exists = await prisma.testQuestion.findFirst({
        where: { testId, questionId: qId }
      });

      if (!exists) {
        const created = await prisma.testQuestion.create({
          data: {
            testId,
            questionId: qId,
            order: currentOrder,
            weight: 1.0,
          }
        });
        newTestQuestions.push(created);
        currentOrder++;
      }
    }

    return NextResponse.json(newTestQuestions, { status: 201 });
  } catch (error) {
    console.error("POST /api/tests/[id]/questions error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
