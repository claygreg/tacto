import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/tests/[id]/assignments -> List assignments for this test
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const assignments = await prisma.testAssignment.findMany({
      where: { testId: params.id },
      include: {
        classroom: true,
        _count: {
          select: { submissions: true }
        }
      },
      orderBy: { appliedAt: 'desc' }
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error("GET /api/tests/[id]/assignments Error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}

// POST /api/tests/[id]/assignments -> Create a new assignment
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { classroomId } = await request.json();

    if (!classroomId) {
      return NextResponse.json({ error: "Turma (classroomId) é obrigatória." }, { status: 400 });
    }

    // Verify test exists and belongs to user
    const test = await prisma.test.findFirst({
      where: { id: params.id, user: { email: session.user.email } }
    });

    if (!test) {
      return NextResponse.json({ error: "Prova não encontrada." }, { status: 404 });
    }

    // Verify classroom exists and belongs to user
    const classroom = await prisma.classroom.findFirst({
      where: { id: classroomId, user: { email: session.user.email } }
    });

    if (!classroom) {
      return NextResponse.json({ error: "Turma não encontrada." }, { status: 404 });
    }

    // Check if assignment already exists
    const existing = await prisma.testAssignment.findFirst({
      where: { testId: params.id, classroomId }
    });

    if (existing) {
      // Just return the existing one
      return NextResponse.json(existing);
    }

    // Create assignment
    const assignment = await prisma.testAssignment.create({
      data: {
        testId: params.id,
        classroomId,
        appliedAt: new Date()
      }
    });

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("POST /api/tests/[id]/assignments Error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
