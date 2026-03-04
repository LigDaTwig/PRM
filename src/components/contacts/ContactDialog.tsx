"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
  const [isDirty, setIsDirty] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  // Skip guard when isLoading — means a successful submit is closing the dialog.
  const handleRequestClose = React.useCallback(() => {
    if (isDirty && !isLoading) {
      setShowConfirm(true);
    } else {
      onClose();
    }
  }, [isDirty, isLoading, onClose]);

  // Reset confirm state when dialog closes so it doesn't flash on next open.
  React.useEffect(() => {
    if (!open) setShowConfirm(false);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleRequestClose()}>
      <DialogContent className="relative max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{contact ? "Edit Contact" : "Add Contact"}</DialogTitle>
        </DialogHeader>
        <ContactForm
          contact={contact}
          groups={groups}
          onSubmit={onSubmit}
          onCancel={handleRequestClose}
          onDirtyChange={setIsDirty}
          isLoading={isLoading}
        />

        {/* Unsaved-changes confirm overlay */}
        {showConfirm && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 rounded-lg bg-white/85 backdrop-blur-sm">
            <div className="text-center space-y-1.5 px-8">
              <h3 className="font-semibold text-base">Discard changes?</h3>
              <p className="text-sm text-[--muted-foreground]">
                You have unsaved changes. Leaving will discard them.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirm(false)}
              >
                Keep editing
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setShowConfirm(false);
                  onClose();
                }}
              >
                Discard
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
