"use client";

import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown, ExternalLink, Pencil, Trash2, Cake } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WarmthBadge } from "@/components/WarmthBadge";
import { LastInteractionBadge } from "@/components/LastInteractionBadge";
import type { Contact } from "@/types";

interface ContactTableProps {
  contacts: Contact[];
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
}

export function ContactTable({ contacts, onEdit, onDelete }: ContactTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const columns: ColumnDef<Contact>[] = [
    {
      accessorFn: (row) => `${row.lastName} ${row.firstName}`,
      id: "name",
      header: ({ column }) => (
        <SortButton
          label="Name"
          sorted={column.getIsSorted()}
          onClick={() => column.toggleSorting()}
        />
      ),
      cell: ({ row }) => (
        <button
          className="text-left font-medium hover:text-[--primary] hover:underline"
          onClick={() => router.push(`/contacts/${row.original.id}`)}
        >
          {row.original.firstName} {row.original.lastName}
        </button>
      ),
    },
    {
      id: "title",
      header: "Title / Company",
      cell: ({ row }) => {
        const { workTitle, company } = row.original;
        if (!workTitle && !company) return <span className="text-[--muted-foreground]">—</span>;
        return (
          <div className="text-sm">
            {workTitle && <div>{workTitle}</div>}
            {company && <div className="text-[--muted-foreground]">{company}</div>}
          </div>
        );
      },
    },
    {
      id: "groups",
      header: "Groups",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.groups.map((g) => (
            <Badge key={g.id} variant="secondary" className="text-xs">
              {g.name}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "birthday",
      header: "Birthday",
      cell: ({ row }) => {
        const { birthday } = row.original;
        if (!birthday) return <span className="text-[--muted-foreground]">—</span>;
        const date = parseISO(birthday);
        return (
          <div className="flex items-center gap-1.5 text-sm">
            <Cake className="h-3.5 w-3.5 text-[--muted-foreground]" />
            {format(date, "MMM d")}
          </div>
        );
      },
    },
    {
      accessorKey: "warmth",
      header: ({ column }) => (
        <SortButton
          label="Warmth"
          sorted={column.getIsSorted()}
          onClick={() => column.toggleSorting()}
        />
      ),
      cell: ({ row }) => <WarmthBadge value={row.original.warmth} />,
    },
    {
      accessorKey: "lastInteraction",
      header: ({ column }) => (
        <SortButton
          label="Last Interaction"
          sorted={column.getIsSorted()}
          onClick={() => column.toggleSorting()}
        />
      ),
      cell: ({ row }) => <LastInteractionBadge date={row.original.lastInteraction} />,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {row.original.linkedinUrl && (
            <a
              href={row.original.linkedinUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 text-[--muted-foreground] hover:text-[--foreground]"
              title="LinkedIn"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(row.original)}
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[--destructive] hover:text-[--destructive]"
            onClick={() => onDelete(row.original)}
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: contacts,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 25 } },
  });

  return (
    <div className="space-y-2">
      <div className="rounded-md border border-[--border] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[--muted]/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left font-medium text-[--muted-foreground]"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-[--muted-foreground]"
                >
                  No contacts found.
                </td>
              </tr>
            )}
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-t border-[--border] hover:bg-[--muted]/30 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-[--muted-foreground]">
        <span>
          {contacts.length} contact{contacts.length !== 1 ? "s" : ""}
          {table.getPageCount() > 1 &&
            ` — page ${table.getState().pagination.pageIndex + 1} of ${table.getPageCount()}`}
        </span>
        {table.getPageCount() > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function SortButton({
  label,
  sorted,
  onClick,
}: {
  label: string;
  sorted: false | "asc" | "desc";
  onClick: () => void;
}) {
  return (
    <button
      className="flex items-center gap-1 hover:text-[--foreground] transition-colors"
      onClick={onClick}
    >
      {label}
      {sorted === false && <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />}
      {sorted === "asc" && <ArrowUp className="h-3.5 w-3.5" />}
      {sorted === "desc" && <ArrowDown className="h-3.5 w-3.5" />}
    </button>
  );
}
