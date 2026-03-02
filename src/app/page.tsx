"use client";

import * as React from "react";
import { Search, Plus, SlidersHorizontal, X } from "lucide-react";
import { ContactTable } from "@/components/contacts/ContactTable";
import { ContactDialog } from "@/components/contacts/ContactDialog";
import { DeleteDialog } from "@/components/contacts/DeleteDialog";
import { ImportDialog } from "@/components/ImportDialog";
import { ExportMenu } from "@/components/ExportMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { Contact, Group } from "@/types";
import type { ContactFormValues } from "@/lib/validations";

export default function HomePage() {
  const { toast } = useToast();

  // Data
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [groups, setGroups] = React.useState<Group[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Filters
  const [search, setSearch] = React.useState("");
  const [selectedGroup, setSelectedGroup] = React.useState("");
  const [showFilters, setShowFilters] = React.useState(false);
  const [warmthRange, setWarmthRange] = React.useState<[number, number]>([0, 10]);

  // Dialogs
  const [addOpen, setAddOpen] = React.useState(false);
  const [editContact, setEditContact] = React.useState<Contact | null>(null);
  const [deleteContact, setDeleteContact] = React.useState<Contact | null>(null);
  const [importOpen, setImportOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  async function fetchContacts(filters?: {
    search?: string;
    group?: string;
    minWarmth?: number;
    maxWarmth?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.search) params.set("search", filters.search);
    if (filters?.group) params.set("group", filters.group);
    if (filters?.minWarmth !== undefined) params.set("minWarmth", String(filters.minWarmth));
    if (filters?.maxWarmth !== undefined) params.set("maxWarmth", String(filters.maxWarmth));

    const res = await fetch(`/api/contacts?${params}`);
    const data = await res.json();
    setContacts(data);
  }

  async function fetchGroups() {
    const res = await fetch("/api/groups");
    const data = await res.json();
    setGroups(data);
  }

  React.useEffect(() => {
    Promise.all([fetchContacts(), fetchGroups()]).finally(() => setLoading(false));
  }, []);

  // Debounced search + filter re-fetch
  React.useEffect(() => {
    const t = setTimeout(() => {
      fetchContacts({
        search,
        group: selectedGroup,
        minWarmth: warmthRange[0],
        maxWarmth: warmthRange[1],
      });
    }, 300);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, selectedGroup, warmthRange[0], warmthRange[1]]);

  async function handleAdd(data: ContactFormValues) {
    setSaving(true);
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create");
      await fetchContacts({ search, group: selectedGroup, minWarmth: warmthRange[0], maxWarmth: warmthRange[1] });
      setAddOpen(false);
      toast({ title: "Contact added" });
    } catch {
      toast({ title: "Failed to add contact", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(data: ContactFormValues) {
    if (!editContact) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/contacts/${editContact.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update");
      await fetchContacts({ search, group: selectedGroup, minWarmth: warmthRange[0], maxWarmth: warmthRange[1] });
      setEditContact(null);
      toast({ title: "Contact updated" });
    } catch {
      toast({ title: "Failed to update contact", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteContact) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/contacts/${deleteContact.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      await fetchContacts({ search, group: selectedGroup, minWarmth: warmthRange[0], maxWarmth: warmthRange[1] });
      setDeleteContact(null);
      toast({ title: "Contact deleted" });
    } catch {
      toast({ title: "Failed to delete contact", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  }

  const activeFilters = [
    selectedGroup && `Group: ${selectedGroup}`,
    (warmthRange[0] > 0 || warmthRange[1] < 10) && `Warmth: ${warmthRange[0]}–${warmthRange[1]}`,
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contacts</h1>
          <p className="text-sm text-[--muted-foreground]">
            {loading ? "Loading..." : `${contacts.length} contact${contacts.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Contact
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[--muted-foreground]" />
          <Input
            placeholder="Search by name, email, company..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[--muted-foreground] hover:text-[--foreground]"
              onClick={() => setSearch("")}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Button
          variant={showFilters ? "secondary" : "outline"}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilters.length > 0 && (
            <Badge
              variant="default"
              className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {activeFilters.length}
            </Badge>
          )}
        </Button>

        <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
          Import
        </Button>

        <ExportMenu />
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="rounded-lg border border-[--border] bg-[--muted]/30 p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Filter by Group</label>
              <select
                className="flex h-9 w-full rounded-md border border-[--input] bg-white px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--ring]"
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
              >
                <option value="">All groups</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.name}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Warmth Range:{" "}
                <span className="font-normal text-[--muted-foreground]">
                  {warmthRange[0]} – {warmthRange[1]}
                </span>
              </label>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[--muted-foreground] w-3">0</span>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={warmthRange[0]}
                  onChange={(e) =>
                    setWarmthRange([
                      Math.min(Number(e.target.value), warmthRange[1]),
                      warmthRange[1],
                    ])
                  }
                  className="flex-1"
                />
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={warmthRange[1]}
                  onChange={(e) =>
                    setWarmthRange([
                      warmthRange[0],
                      Math.max(Number(e.target.value), warmthRange[0]),
                    ])
                  }
                  className="flex-1"
                />
                <span className="text-xs text-[--muted-foreground] w-3">10</span>
              </div>
            </div>
          </div>

          {activeFilters.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {activeFilters.map((f) => (
                <Badge key={f} variant="secondary">
                  {f}
                </Badge>
              ))}
              <button
                className="text-xs text-[--muted-foreground] hover:text-[--foreground] underline"
                onClick={() => {
                  setSelectedGroup("");
                  setWarmthRange([0, 10]);
                }}
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-[--muted-foreground]">Loading contacts...</div>
      ) : (
        <ContactTable
          contacts={contacts}
          onEdit={(c) => setEditContact(c)}
          onDelete={(c) => setDeleteContact(c)}
        />
      )}

      {/* Dialogs */}
      <ContactDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        groups={groups}
        onSubmit={handleAdd}
        isLoading={saving}
      />

      {editContact && (
        <ContactDialog
          open
          onClose={() => setEditContact(null)}
          contact={editContact}
          groups={groups}
          onSubmit={handleEdit}
          isLoading={saving}
        />
      )}

      {deleteContact && (
        <DeleteDialog
          open
          onClose={() => setDeleteContact(null)}
          onConfirm={handleDelete}
          contactName={`${deleteContact.firstName} ${deleteContact.lastName}`}
          isLoading={deleting}
        />
      )}

      <ImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={() =>
          fetchContacts({
            search,
            group: selectedGroup,
            minWarmth: warmthRange[0],
            maxWarmth: warmthRange[1],
          })
        }
      />
    </div>
  );
}
