import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/questions — listar questões com filtros
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const discipline = searchParams.get("discipline");
  const type = searchParams.get("type");
  const difficulty = searchParams.get("difficulty");
  const search = searchParams.get("search");

  const where: any = {
    userId: session.user.id, // Apenas do banco pessoal por padrão
  };

  if (discipline && discipline !== "Todas") {
    where.discipline = discipline;
  }
  
  if (type && type !== "Todos") {
    // Mapeamento caso venha em português
    if (type === "Múltipla Escolha") where.type = "multiple_choice";
    else if (type === "Discursiva") where.type = "discursive";
    else where.type = type;
  }

  if (difficulty && difficulty !== "Todos") {
    if (difficulty === "Fácil") where.difficulty = "easy";
    else if (difficulty === "Médio") where.difficulty = "medium";
    else if (difficulty === "Difícil") where.difficulty = "hard";
    else where.difficulty = difficulty;
  }

  if (search) {
    where.OR = [
      { body: { contains: search } },
      { baseText: { contains: search } },
      { tags: { contains: search } },
      { bnccCode: { contains: search } },
    ];
  }

  const questions = await prisma.question.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      options: true, // Útil para mostrar detalhes se necessário
    },
  });

  return NextResponse.json(questions);
}

// POST /api/questions — criar nova questão
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const data = await req.json();

  if (!data.type || !data.body || !data.difficulty || !data.folderId) {
    return NextResponse.json({ message: "Campos obrigatórios faltando (incluindo folderId)" }, { status: 400 });
  }

  // Verifica se a pasta existe e pertence ao usuário
  const folder = await prisma.questionFolder.findUnique({ where: { id: data.folderId } });
  if (!folder || folder.userId !== session.user.id) {
    return NextResponse.json({ message: "Pasta inválida ou não encontrada" }, { status: 400 });
  }

  const question = await prisma.question.create({
    data: {
      type: data.type,
      body: data.body,
      baseText: data.baseText || null,
      discipline: data.discipline || null,
      tags: data.tags ? JSON.stringify(data.tags) : null,
      bnccCode: data.bnccCode || null,
      yearLevel: data.yearLevel || null,
      difficulty: data.difficulty,
      source: data.source || "personal",
      userId: session.user.id,
      options: data.type === "multiple_choice" && data.options && data.options.length > 0 
        ? {
            create: data.options.map((opt: any) => ({
              label: opt.label,
              text: opt.text,
              isCorrect: opt.isCorrect,
            }))
          }
        : undefined,
      folderItems: {
        create: {
          folderId: data.folderId
        }
      }
    },
    include: {
      options: true,
    }
  });

  return NextResponse.json(question, { status: 201 });
}

