import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tests = await prisma.test.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { questions: true }
        }
      }
    });

    return NextResponse.json(tests);
  } catch (error) {
    console.error("GET /api/tests error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, instructions } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const test = await prisma.test.create({
      data: {
        title,
        instructions: instructions || null,
        userId: session.user.id,
      },
    });

    return NextResponse.json(test, { status: 201 });
  } catch (error) {
    console.error("POST /api/tests error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
