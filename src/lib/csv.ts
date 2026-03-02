import Papa from "papaparse";
import type { Contact } from "@/types";

export const CSV_COLUMNS = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "workTitle",
  "company",
  "warmth",
  "notes",
  "lastInteraction",
  "linkedinUrl",
  "groups",
] as const;

type CsvRow = Record<string, string>;

export function parseCSV(text: string): CsvRow[] {
  const result = Papa.parse<CsvRow>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });
  return result.data;
}

export function contactsToCSV(contacts: Contact[]): string {
  const rows = contacts.map((c) => ({
    firstName: c.firstName,
    lastName: c.lastName,
    email: c.email ?? "",
    phone: c.phone ?? "",
    workTitle: c.workTitle ?? "",
    company: c.company ?? "",
    warmth: c.warmth,
    notes: c.notes ?? "",
    lastInteraction: c.lastInteraction ?? "",
    linkedinUrl: c.linkedinUrl ?? "",
    groups: c.groups.map((g) => g.name).join("|"),
  }));

  return Papa.unparse(rows, { columns: [...CSV_COLUMNS] });
}
