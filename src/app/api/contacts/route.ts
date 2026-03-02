import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ContactSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search") ?? "";
  const group = searchParams.get("group") ?? "";
  const minWarmth = parseInt(searchParams.get("minWarmth") ?? "0", 10);
  const maxWarmth = parseInt(searchParams.get("maxWarmth") ?? "10", 10);
  const sort = searchParams.get("sort") ?? "lastName";
  const order = (searchParams.get("order") ?? "asc") as "asc" | "desc";

  const validSortFields = [
    "firstName",
    "lastName",
    "company",
    "warmth",
    "lastInteraction",
    "createdAt",
  ];
  const sortField = validSortFields.includes(sort) ? sort : "lastName";

  const contacts = await prisma.contact.findMany({
    where: {
      AND: [
        search
          ? {
              OR: [
                { firstName: { contains: search } },
                { lastName: { contains: search } },
                { email: { contains: search } },
                { company: { contains: search } },
              ],
            }
          : {},
        group
          ? { groups: { some: { group: { name: group } } } }
          : {},
        { warmth: { gte: minWarmth, lte: maxWarmth } },
      ],
    },
    include: {
      groups: { include: { group: true } },
    },
    orderBy: { [sortField]: order },
  });

  const result = contacts.map((c) => ({
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
  }));

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = ContactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { groupIds = [], lastInteraction, birthday, email, phone, workTitle, company, notes, linkedinUrl, ...rest } =
    parsed.data;

  const contact = await prisma.contact.create({
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
        create: groupIds.map((groupId) => ({ groupId })),
      },
    },
    include: {
      groups: { include: { group: true } },
    },
  });

  return NextResponse.json(
    {
      ...contact,
      lastInteraction: contact.lastInteraction?.toISOString() ?? null,
      birthday: contact.birthday?.toISOString() ?? null,
      createdAt: contact.createdAt.toISOString(),
      updatedAt: contact.updatedAt.toISOString(),
      groups: contact.groups.map((cg) => ({
        id: cg.group.id,
        name: cg.group.name,
        createdAt: cg.group.createdAt.toISOString(),
      })),
    },
    { status: 201 }
  );
}
