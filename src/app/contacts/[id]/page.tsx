"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Pencil, Trash2, Mail, Phone } from "lucide-react";
import { ContactDialog } from "@/components/contacts/ContactDialog";
import { DeleteDialog } from "@/components/contacts/DeleteDialog";
import { WarmthBadge } from "@/components/WarmthBadge";
import { LastInteractionBadge } from "@/components/LastInteractionBadge";
import { BirthdayBadge } from "@/components/BirthdayBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Contact, Group } from "@/types";
import type { ContactFormValues } from "@/lib/validations";

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();

  const [contact, setContact] = React.useState<Contact | null>(null);
  const [groups, setGroups] = React.useState<Group[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [notes, setNotes] = React.useState("");
  const [notesSaving, setNotesSaving] = React.useState(false);

  async function fetchContact() {
    const res = await fetch(`/api/contacts/${id}`);
    if (!res.ok) { router.push("/"); return; }
    const data: Contact = await res.json();
    setContact(data);
    setNotes(data.notes ?? "");
  }

  React.useEffect(() => {
    Promise.all([
      fetchContact(),
      fetch("/api/groups").then((r) => r.json()).then(setGroups),
    ]).finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleEdit(data: ContactFormValues) {
    if (!contact) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/contacts/${contact.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      await fetchContact();
      setEditOpen(false);
      toast({ title: "Contact updated" });
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!contact) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/contacts/${contact.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast({ title: "Contact deleted" });
      router.push("/");
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
      setDeleting(false);
    }
  }

  async function saveNotes() {
    if (!contact || notesSaving) return;
    setNotesSaving(true);
    try {
      await fetch(`/api/contacts/${contact.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email ?? "",
          phone: contact.phone ?? "",
          workTitle: contact.workTitle ?? "",
          company: contact.company ?? "",
          warmth: contact.warmth,
          notes,
          lastInteraction: contact.lastInteraction ?? "",
          birthday: contact.birthday ? contact.birthday.slice(0, 10) : "",
          linkedinUrl: contact.linkedinUrl ?? "",
          groupIds: contact.groups.map((g) => g.id),
        }),
      });
      toast({ title: "Notes saved" });
    } catch {
      toast({ title: "Failed to save notes", variant: "destructive" });
    } finally {
      setNotesSaving(false);
    }
  }

  async function logInteractionToday() {
    if (!contact) return;
    const today = new Date().toISOString().slice(0, 10);
    try {
      const res = await fetch(`/api/contacts/${contact.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email ?? "",
          phone: contact.phone ?? "",
          workTitle: contact.workTitle ?? "",
          company: contact.company ?? "",
          warmth: contact.warmth,
          notes: contact.notes ?? "",
          lastInteraction: today,
          birthday: contact.birthday ? contact.birthday.slice(0, 10) : "",
          linkedinUrl: contact.linkedinUrl ?? "",
          groupIds: contact.groups.map((g) => g.id),
        }),
      });
      if (!res.ok) throw new Error();
      await fetchContact();
      toast({ title: "Interaction logged" });
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-[--muted-foreground]">Loading...</div>;
  }

  if (!contact) return null;

  return (
    <div className="max-w-2xl space-y-6">
      {/* Back + actions */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
          <ArrowLeft className="h-4 w-4" />
          Back to contacts
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-[--destructive] hover:text-[--destructive]"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Contact card */}
      <div className="rounded-lg border border-[--border] bg-[--card] p-6 space-y-5">
        {/* Name + title */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {contact.firstName} {contact.lastName}
            </h1>
            {(contact.workTitle || contact.company) && (
              <p className="text-[--muted-foreground] mt-0.5">
                {[contact.workTitle, contact.company].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
          {contact.linkedinUrl && (
            <a
              href={contact.linkedinUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[--muted-foreground] hover:text-[--foreground]"
              title="LinkedIn profile"
            >
              <ExternalLink className="h-5 w-5" />
            </a>
          )}
        </div>

        {/* Contact info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className="flex items-center gap-2 text-sm hover:text-[--primary]"
            >
              <Mail className="h-4 w-4 text-[--muted-foreground]" />
              {contact.email}
            </a>
          )}
          {contact.phone && (
            <a
              href={`tel:${contact.phone}`}
              className="flex items-center gap-2 text-sm hover:text-[--primary]"
            >
              <Phone className="h-4 w-4 text-[--muted-foreground]" />
              {contact.phone}
            </a>
          )}
        </div>

        {/* Groups */}
        {contact.groups.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {contact.groups.map((g) => (
              <Badge key={g.id} variant="secondary">
                {g.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Warmth */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Warmth</span>
          <div className="w-48">
            <WarmthBadge value={contact.warmth} />
          </div>
        </div>

        {/* Last interaction */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Last Interaction</span>
          <LastInteractionBadge
            date={contact.lastInteraction}
            onUpdate={logInteractionToday}
          />
        </div>

        {/* Birthday */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Birthday</span>
          <BirthdayBadge date={contact.birthday} />
        </div>

        {/* Added */}
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Added</span>
          <span className="text-[--muted-foreground]">
            {new Date(contact.createdAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Notes */}
      <div className="rounded-lg border border-[--border] bg-[--card] p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Notes</h2>
          {notesSaving && (
            <span className="text-xs text-[--muted-foreground]">Saving...</span>
          )}
        </div>
        <Textarea
          rows={6}
          placeholder="Add notes about this contact..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={saveNotes}
        />
        <p className="text-xs text-[--muted-foreground]">Auto-saves when you click away.</p>
      </div>

      {/* Dialogs */}
      {editOpen && (
        <ContactDialog
          open
          onClose={() => setEditOpen(false)}
          contact={contact}
          groups={groups}
          onSubmit={handleEdit}
          isLoading={saving}
        />
      )}

      <DeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        contactName={`${contact.firstName} ${contact.lastName}`}
        isLoading={deleting}
      />
    </div>
  );
}
