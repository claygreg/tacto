import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { assignmentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const assignment = await prisma.testAssignment.findUnique({
      where: { id: params.assignmentId },
      include: {
        classroom: {
          include: {
            students: {
              orderBy: { fullName: 'asc' }
            }
          }
        },
        test: {
          include: {
            questions: {
              orderBy: { order: 'asc' },
              include: {
                question: {
                  include: {
                    options: true
                  }
                }
              }
            }
          }
        },
        submissions: {
          include: {
            results: true
          }
        }
      }
    });

    if (!assignment) {
      return NextResponse.json({ error: "Aplicação não encontrada." }, { status: 404 });
    }

    // Security check: Make sure test belongs to user
    if (assignment.test.userId !== (await prisma.user.findUnique({ where: { email: session.user.email } }))?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("GET /api/assignments/[assignmentId] Error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
