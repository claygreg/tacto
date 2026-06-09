import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/questions/public — listar questões do acervo público
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const discipline = searchParams.get("discipline");
  const sourceFilter = searchParams.get("source"); // ex: "ENEM", "ENEM 2024", "Todas"
  const search = searchParams.get("search");

  const where: any = {
    source: "public",
  };

  if (discipline && discipline !== "Todas as disciplinas") {
    where.discipline = discipline;
  }

  if (search) {
    where.OR = [
      { body: { contains: search } },
      { tags: { contains: search } },
    ];
  }

  if (sourceFilter && sourceFilter !== "Todas") {
    where.tags = { contains: sourceFilter };
  }

  const questions = await prisma.question.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50, // Limite para evitar travar a UI com centenas de questões
    include: {
      options: true,
    },
  });

  return NextResponse.json(questions);
}
