import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
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
    const { orderedIds } = body; // Array of TestQuestion IDs in the new order

    if (!Array.isArray(orderedIds)) {
      return NextResponse.json({ error: "orderedIds must be an array" }, { status: 400 });
    }

    // Verify test ownership
    const test = await prisma.test.findUnique({
      where: { id: testId },
      select: { userId: true }
    });

    if (!test || test.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    // Update orders in a transaction
    await prisma.$transaction(
      orderedIds.map((testQuestionId, index) => 
        prisma.testQuestion.update({
          where: { id: testQuestionId },
          data: { order: index }
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/tests/[id]/questions/reorder error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
