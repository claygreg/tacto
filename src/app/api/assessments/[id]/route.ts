import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/assessments/[id] — detalhe da prova
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
        select: { 
          name: true, 
          subject: true, 
          year: true,
          _count: { select: { students: true } }
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

  return NextResponse.json({
    id: assessment.id,
    name: assessment.name,
    classroomId: assessment.classroomId,
    classroomName: assessment.classroom.name,
    subject: assessment.classroom.subject,
    year: assessment.classroom.year,
    studentCount: assessment.classroom._count.students,
    status: assessment.appliedAt ? "applied" : assessment.items.length > 0 ? "exported" : "draft",
    createdAt: assessment.createdAt.toISOString(),
    appliedAt: assessment.appliedAt ? assessment.appliedAt.toISOString() : null,
    items: assessment.items.map((item) => ({
      id: item.id,
      order: item.order,
      weight: item.weight,
      question: item.question,
    })),
  });
}
