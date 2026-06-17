import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/folders/[id] — rename or change color
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const folder = await prisma.questionFolder.findUnique({ where: { id } });
  if (!folder || folder.userId !== session.user.id) {
    return NextResponse.json({ message: "Não encontrado" }, { status: 404 });
  }

  const { name, color } = await req.json();
  const updated = await prisma.questionFolder.update({
    where: { id },
    data: {
      ...(name?.trim() ? { name: name.trim() } : {}),
      ...(color !== undefined ? { color } : {}),
    },
    include: { _count: { select: { questions: true } } },
  });

  return NextResponse.json({
    id: updated.id,
    name: updated.name,
    color: updated.color,
    questionCount: updated._count.questions,
    createdAt: updated.createdAt.toISOString(),
  });
}

// DELETE /api/folders/[id] — delete folder
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const folder = await prisma.questionFolder.findUnique({ where: { id } });
  if (!folder || folder.userId !== session.user.id) {
    return NextResponse.json({ message: "Não encontrado" }, { status: 404 });
  }

  await prisma.questionFolder.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
