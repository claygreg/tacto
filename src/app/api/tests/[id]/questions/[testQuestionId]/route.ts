import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; testQuestionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const testId = params.id;
    const testQuestionId = params.testQuestionId;

    // Verify test ownership
    const test = await prisma.test.findUnique({
      where: { id: testId },
      select: { userId: true }
    });

    if (!test || test.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    // Delete the relation
    await prisma.testQuestion.delete({
      where: { id: testQuestionId }
    });

    // We don't necessarily need to reorder the remaining items immediately,
    // since 'order' just dictates relative sorting, but we could.

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/tests/[id]/questions/[testQuestionId] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
