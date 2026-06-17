import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const testId = params.id;

    const test = await prisma.test.findUnique({
      where: {
        id: testId,
        userId: session.user.id, // Ensure user owns the test
      },
      include: {
        questions: {
          orderBy: { order: "asc" },
          include: {
            question: {
              include: {
                options: true,
              }
            }
          }
        }
      }
    });

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    return NextResponse.json(test);
  } catch (error) {
    console.error("GET /api/tests/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

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
    const { title, instructions } = body;

    // Verify ownership
    const existingTest = await prisma.test.findUnique({
      where: { id: testId },
      select: { userId: true }
    });

    if (!existingTest || existingTest.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    const updatedTest = await prisma.test.update({
      where: { id: testId },
      data: {
        title: title !== undefined ? title : undefined,
        instructions: instructions !== undefined ? instructions : undefined,
      }
    });

    return NextResponse.json(updatedTest);
  } catch (error) {
    console.error("PUT /api/tests/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const testId = params.id;

    const existingTest = await prisma.test.findUnique({
      where: { id: testId },
      select: { userId: true }
    });

    if (!existingTest || existingTest.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    await prisma.test.delete({
      where: { id: testId }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/tests/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
