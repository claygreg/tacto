import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/folders — list user's folders with question count
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const folders = await prisma.questionFolder.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { questions: true } },
    },
  });

  return NextResponse.json(
    folders.map((f) => ({
      id: f.id,
      name: f.name,
      color: f.color,
      questionCount: f._count.questions,
      createdAt: f.createdAt.toISOString(),
    }))
  );
}

// POST /api/folders — create folder
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const { name, color } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ message: "Nome obrigatório" }, { status: 400 });
  }

  const folder = await prisma.questionFolder.create({
    data: {
      name: name.trim(),
      color: color ?? null,
      userId: session.user.id,
    },
    include: { _count: { select: { questions: true } } },
  });

  return NextResponse.json(
    {
      id: folder.id,
      name: folder.name,
      color: folder.color,
      questionCount: folder._count.questions,
      createdAt: folder.createdAt.toISOString(),
    },
    { status: 201 }
  );
}
