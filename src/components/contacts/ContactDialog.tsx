"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ContactForm } from "./ContactForm";
import type { Contact, Group } from "@/types";
import type { ContactFormValues } from "@/lib/validations";

interface ContactDialogProps {
  open: boolean;
  onClose: () => void;
  contact?: Contact;
  groups: Group[];
  onSubmit: (data: ContactFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function ContactDialog({
  open,
  onClose,
  contact,
  groups,
  onSubmit,
  isLoading,
}: ContactDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{contact ? "Edit Contact" : "Add Contact"}</DialogTitle>
        </DialogHeader>
        <ContactForm
          contact={contact}
          groups={groups}
          onSubmit={onSubmit}
          onCancel={onClose}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
