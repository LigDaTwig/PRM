import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseCSV } from "@/lib/csv";
import { parseExcel } from "@/lib/excel";

type ImportRow = Record<string, string | number>;

async function processRows(rows: ImportRow[]) {
  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  // Pre-fetch all groups to map by name
  const allGroups = await prisma.group.findMany();
  const groupByName = new Map(allGroups.map((g) => [g.name.toLowerCase(), g]));

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // 1-based + header

    const firstName = String(row.firstName ?? "").trim();
    const lastName = String(row.lastName ?? "").trim();

    if (!firstName && !lastName) {
      skipped++;
      continue;
    }

    if (!firstName || !lastName) {
      errors.push(`Row ${rowNum}: Missing first or last name`);
      skipped++;
      continue;
    }

    try {
      const warmthRaw = Number(row.warmth);
      const warmth =
        isNaN(warmthRaw) || warmthRaw < 0 || warmthRaw > 10
          ? 5
          : Math.round(warmthRaw);

      const groupNames = String(row.groups ?? "")
        .split("|")
        .map((s) => s.trim())
        .filter(Boolean);

      // Upsert groups that don't exist
      const groupIds: string[] = [];
      for (const name of groupNames) {
        let group = groupByName.get(name.toLowerCase());
        if (!group) {
          group = await prisma.group.create({ data: { name } });
          groupByName.set(name.toLowerCase(), group);
        }
        groupIds.push(group.id);
      }

      const lastInteractionRaw = String(row.lastInteraction ?? "").trim();
      const lastInteraction =
        lastInteractionRaw && !isNaN(Date.parse(lastInteractionRaw))
          ? new Date(lastInteractionRaw)
          : null;

      await prisma.contact.create({
        data: {
          firstName,
          lastName,
          email: String(row.email ?? "").trim() || null,
          phone: String(row.phone ?? "").trim() || null,
          workTitle: String(row.workTitle ?? "").trim() || null,
          company: String(row.company ?? "").trim() || null,
          warmth,
          notes: String(row.notes ?? "").trim() || null,
          lastInteraction,
          linkedinUrl: String(row.linkedinUrl ?? "").trim() || null,
          groups: {
            create: groupIds.map((groupId) => ({ groupId })),
          },
        },
      });

      imported++;
    } catch (e) {
      errors.push(`Row ${rowNum}: ${e instanceof Error ? e.message : "Unknown error"}`);
      skipped++;
    }
  }

  return { imported, skipped, errors };
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const filename = file.name.toLowerCase();
  let rows: ImportRow[] = [];

  if (filename.endsWith(".csv")) {
    const text = await file.text();
    rows = parseCSV(text) as ImportRow[];
  } else if (filename.endsWith(".xlsx") || filename.endsWith(".xls")) {
    const buffer = await file.arrayBuffer();
    rows = parseExcel(buffer) as ImportRow[];
  } else {
    return NextResponse.json(
      { error: "Unsupported file type. Use .csv, .xlsx, or .xls" },
      { status: 400 }
    );
  }

  const result = await processRows(rows);
  return NextResponse.json(result);
}
