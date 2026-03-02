import * as XLSX from "xlsx";
import type { Contact } from "@/types";
import { CSV_COLUMNS } from "./csv";

type SheetRow = Record<string, string | number>;

export function parseExcel(buffer: ArrayBuffer): SheetRow[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json<SheetRow>(sheet, { defval: "" });
}

export function contactsToExcel(contacts: Contact[]): Uint8Array {
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

  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: [...CSV_COLUMNS],
  });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Contacts");

  const excelBuffer = XLSX.write(workbook, {
    type: "array",
    bookType: "xlsx",
  });
  return new Uint8Array(excelBuffer);
}
