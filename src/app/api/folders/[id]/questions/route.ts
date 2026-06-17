import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/folders/[id]/questions — list questions in folder (with filters)
export async function GET(
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

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");
  const discipline = searchParams.get("discipline");
  const difficulty = searchParams.get("difficulty");
  const type = searchParams.get("type");
  const yearLevel = searchParams.get("yearLevel");

  const folderItems = await prisma.folderQuestion.findMany({
    where: { folderId: id },
    include: {
      question: {
        include: { options: true },
      },
    },
    orderBy: { addedAt: "desc" },
  });

  let questions = folderItems.map((fi) => fi.question);

  // Apply filters in-memory (folder is usually small)
  if (search) {
    const q = search.toLowerCase();
    questions = questions.filter(
      (q2) =>
        q2.body.toLowerCase().includes(q) ||
        (q2.baseText?.toLowerCase().includes(q) ?? false) ||
        (q2.bnccCode?.toLowerCase().includes(q) ?? false) ||
        (q2.tags?.toLowerCase().includes(q) ?? false)
    );
  }
  if (discipline && discipline !== "Todas")
    questions = questions.filter((q2) => q2.discipline === discipline);
  if (difficulty && difficulty !== "Todos")
    questions = questions.filter((q2) => q2.difficulty === difficulty);
  if (type && type !== "Todos")
    questions = questions.filter((q2) => q2.type === type);
  if (yearLevel && yearLevel !== "Todos")
    questions = questions.filter((q2) => q2.yearLevel === yearLevel);

  return NextResponse.json(questions);
}

// POST /api/folders/[id]/questions — add question to folder
export async function POST(
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

  const { questionId } = await req.json();
  if (!questionId) {
    return NextResponse.json({ message: "questionId obrigatório" }, { status: 400 });
  }

  // Upsert — idempotent add
  await prisma.folderQuestion.upsert({
    where: { folderId_questionId: { folderId: id, questionId } },
    create: { folderId: id, questionId },
    update: {},
  });

  return new NextResponse(null, { status: 201 });
}

// DELETE /api/folders/[id]/questions — remove question from folder
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const { questionId } = await req.json();

  const folder = await prisma.questionFolder.findUnique({ where: { id } });
  if (!folder || folder.userId !== session.user.id) {
    return NextResponse.json({ message: "Não encontrado" }, { status: 404 });
  }

  await prisma.folderQuestion.deleteMany({
    where: { folderId: id, questionId },
  });

  return new NextResponse(null, { status: 204 });
}
