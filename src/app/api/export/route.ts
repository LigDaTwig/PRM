import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { contactsToCSV } from "@/lib/csv";
import { contactsToExcel } from "@/lib/excel";
import type { Contact } from "@/types";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const format = searchParams.get("format") ?? "csv";

  const contacts = await prisma.contact.findMany({
    include: { groups: { include: { group: true } } },
    orderBy: { lastName: "asc" },
  });

  const serialized: Contact[] = contacts.map((c) => ({
    ...c,
    lastInteraction: c.lastInteraction?.toISOString() ?? null,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    groups: c.groups.map((cg) => ({
      id: cg.group.id,
      name: cg.group.name,
      createdAt: cg.group.createdAt.toISOString(),
    })),
  }));

  if (format === "excel") {
    const buffer = contactsToExcel(serialized);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=contacts.xlsx",
      },
    });
  }

  const csv = contactsToCSV(serialized);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=contacts.csv",
    },
  });
}
