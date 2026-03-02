import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { GroupSchema } from "@/lib/validations";

export async function GET() {
  const groups = await prisma.group.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json(
    groups.map((g) => ({ ...g, createdAt: g.createdAt.toISOString() }))
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = GroupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const group = await prisma.group.create({
    data: { name: parsed.data.name },
  });

  return NextResponse.json(
    { ...group, createdAt: group.createdAt.toISOString() },
    { status: 201 }
  );
}
