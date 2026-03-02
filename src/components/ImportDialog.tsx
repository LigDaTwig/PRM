"use client";

import * as React from "react";
import { Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { ImportResult } from "@/types";

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}

export function ImportDialog({ open, onClose, onImported }: ImportDialogProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<ImportResult | null>(null);
  const { toast } = useToast();

  function handleClose() {
    setFile(null);
    setResult(null);
    onClose();
  }

  async function handleImport() {
    if (!file) return;
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/import", { method: "POST", body: formData });
      const data: ImportResult = await res.json();

      if (!res.ok) {
        toast({ title: "Import failed", description: (data as { error?: string }).error ?? "Unknown error", variant: "destructive" });
        return;
      }

      setResult(data);
      if (data.imported > 0) onImported();
    } catch {
      toast({ title: "Import failed", description: "Network error", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import Contacts</DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file (.csv, .xlsx, .xls). Columns:{" "}
            <code className="text-xs">firstName, lastName, email, phone, workTitle, company, warmth, notes, lastInteraction, linkedinUrl, groups</code>
            . Groups separated by <code>|</code>.
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="space-y-4">
            <label className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[--border] p-8 cursor-pointer hover:bg-[--muted]/30 transition-colors">
              <Upload className="h-8 w-8 text-[--muted-foreground]" />
              <span className="text-sm text-[--muted-foreground]">
                {file ? file.name : "Click to choose file or drag & drop"}
              </span>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                className="sr-only"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleImport} disabled={!file || isLoading}>
                {isLoading ? "Importing..." : "Import"}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-md border border-[--border] p-4 space-y-2">
              <p className="text-sm">
                <span className="font-semibold text-green-600">{result.imported}</span> contacts imported
              </p>
              <p className="text-sm">
                <span className="font-semibold text-[--muted-foreground]">{result.skipped}</span> rows skipped
              </p>
              {result.errors.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-[--destructive]">Errors:</p>
                  <ul className="text-xs text-[--destructive] space-y-0.5 max-h-32 overflow-y-auto">
                    {result.errors.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
