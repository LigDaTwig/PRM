"use client";

import { formatDistanceToNow } from "date-fns";
import { Calendar } from "lucide-react";

interface LastInteractionBadgeProps {
  date: string | null;
  onUpdate?: () => void;
}

export function LastInteractionBadge({ date, onUpdate }: LastInteractionBadgeProps) {
  if (!date) {
    return (
      <span className="text-sm text-[--muted-foreground] italic">
        Never
        {onUpdate && (
          <button
            onClick={onUpdate}
            className="ml-2 text-xs text-[--primary] hover:underline"
          >
            Log today
          </button>
        )}
      </span>
    );
  }

  const d = new Date(date);
  const relative = formatDistanceToNow(d, { addSuffix: true });
  const absolute = d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-[--muted-foreground]" />
      <span className="text-sm" title={absolute}>
        {relative}
      </span>
      {onUpdate && (
        <button
          onClick={onUpdate}
          className="text-xs text-[--primary] hover:underline"
        >
          Update
        </button>
      )}
    </div>
  );
}
