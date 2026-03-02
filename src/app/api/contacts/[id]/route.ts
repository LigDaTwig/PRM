import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ContactSchema } from "@/lib/validations";

type RouteContext = { params: Promise<{ id: string }> };

function formatContact(c: {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  workTitle: string | null;
  company: string | null;
  warmth: number;
  notes: string | null;
  lastInteraction: Date | null;
  birthday: Date | null;
  linkedinUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  groups: { group: { id: string; name: string; createdAt: Date } }[];
}) {
  return {
    ...c,
    lastInteraction: c.lastInteraction?.toISOString() ?? null,
    birthday: c.birthday?.toISOString() ?? null,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    groups: c.groups.map((cg) => ({
      id: cg.group.id,
      name: cg.group.name,
      createdAt: cg.group.createdAt.toISOString(),
    })),
  };
}

export async function GET(_req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;

  const contact = await prisma.contact.findUnique({
    where: { id },
    include: { groups: { include: { group: true } } },
  });

  if (!contact) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  return NextResponse.json(formatContact(contact));
}

export async function PUT(request: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const body = await request.json();
  const parsed = ContactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { groupIds, lastInteraction, birthday, email, phone, workTitle, company, notes, linkedinUrl, ...rest } =
    parsed.data;

  const contact = await prisma.contact.update({
    where: { id },
    data: {
      ...rest,
      email: email || null,
      phone: phone || null,
      workTitle: workTitle || null,
      company: company || null,
      notes: notes || null,
      linkedinUrl: linkedinUrl || null,
      lastInteraction: lastInteraction ? new Date(lastInteraction) : null,
      birthday: birthday ? new Date(birthday) : null,
      groups: {
        deleteMany: {},
        create: groupIds.map((groupId) => ({ groupId })),
      },
    },
    include: { groups: { include: { group: true } } },
  });

  return NextResponse.json(formatContact(contact));
}

export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;

  await prisma.contact.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
