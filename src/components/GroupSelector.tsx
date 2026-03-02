"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Group } from "@/types";

interface GroupSelectorProps {
  groups: Group[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function GroupSelector({ groups, selectedIds, onChange }: GroupSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const selectedGroups = groups.filter((g) => selectedIds.includes(g.id));
  const filtered = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  function toggle(id: string) {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((s) => s !== id)
        : [...selectedIds, id]
    );
  }

  function remove(id: string, e: React.MouseEvent | React.KeyboardEvent) {
    e.stopPropagation();
    onChange(selectedIds.filter((s) => s !== id));
  }

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      {/*
        Use <div> not <button> here — the remove badges contain interactive elements
        and HTML forbids <button> inside <button>.
      */}
      <PopoverPrimitive.Trigger asChild>
        <div
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setOpen((o) => !o);
            }
          }}
          className={cn(
            "flex min-h-9 w-full cursor-pointer flex-wrap items-center gap-1 rounded-md border border-[--input] bg-transparent px-3 py-1.5 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--ring]",
            selectedGroups.length === 0 && "text-[--muted-foreground]"
          )}
        >
          {selectedGroups.length === 0 && <span>Select groups…</span>}
          {selectedGroups.map((g) => (
            <Badge key={g.id} variant="secondary" className="gap-1 pr-1">
              {g.name}
              {/* span with role="button" avoids button-in-button */}
              <span
                role="button"
                tabIndex={0}
                aria-label={`Remove ${g.name}`}
                className="rounded-full hover:bg-[--muted] p-0.5 cursor-pointer"
                onClick={(e) => remove(g.id, e)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") remove(g.id, e);
                }}
              >
                <X className="h-3 w-3" />
              </span>
            </Badge>
          ))}
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </div>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          className="z-50 w-[--radix-popover-trigger-width] rounded-md border border-[--border] bg-[--popover] p-1 shadow-md"
          align="start"
          sideOffset={4}
        >
          <input
            className="flex w-full rounded-sm border-b border-[--border] bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-[--muted-foreground] mb-1"
            placeholder="Search groups..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          <div className="max-h-48 overflow-y-auto" role="listbox">
            {filtered.length === 0 && (
              <p className="py-2 text-center text-sm text-[--muted-foreground]">No groups found</p>
            )}
            {filtered.map((group) => {
              const selected = selectedIds.includes(group.id);
              return (
                <button
                  key={group.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-[--accent] hover:text-[--accent-foreground]"
                  onClick={() => toggle(group.id)}
                >
                  <Check className={cn("h-4 w-4", selected ? "opacity-100" : "opacity-0")} />
                  {group.name}
                </button>
              );
            })}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
