import * as XLSX from "xlsx";
import type { Contact } from "@/types";
import { CSV_COLUMNS } from "./csv";

type SheetRow = Record<string, string | number>;

export function parseExcel(buffer: ArrayBuffer): SheetRow[] {
  // cellDates: true makes SheetJS return real JS Date objects for date cells
  // instead of raw Excel serial numbers (e.g. 46045), which Date.parse() would
  // misread as a year (year 46045).
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  return rows.map((row) => {
    const out: SheetRow = {};
    for (const [k, v] of Object.entries(row)) {
      out[k] = v instanceof Date ? v.toISOString().slice(0, 10) : (v as string | number);
    }
    return out;
  });
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
    birthday: c.birthday ?? "",
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
