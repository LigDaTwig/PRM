"use client";

import { Cake } from "lucide-react";

interface BirthdayBadgeProps {
  date: string | null;
}

function getDaysUntilBirthday(isoDate: string): { days: number; label: string } {
  const bday = new Date(isoDate);
  const month = bday.getUTCMonth();
  const day = bday.getUTCDate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let next = new Date(today.getFullYear(), month, day);
  if (next < today) {
    next = new Date(today.getFullYear() + 1, month, day);
  }

  const days = Math.round((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  let label: string;
  if (days === 0) label = "Today!";
  else if (days === 1) label = "Tomorrow";
  else if (days <= 30) label = `In ${days} days`;
  else label = `In ${days} days`;

  return { days, label };
}

export function BirthdayBadge({ date }: BirthdayBadgeProps) {
  if (!date) {
    return <span className="text-sm text-[--muted-foreground] italic">Not set</span>;
  }

  const bday = new Date(date);
  const formatted = bday.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

  const { days, label } = getDaysUntilBirthday(date);

  const isToday = days === 0;
  const isSoon = days <= 7;

  return (
    <div className="flex items-center gap-2">
      <Cake className={`h-4 w-4 ${isToday ? "text-[--primary]" : "text-[--muted-foreground]"}`} />
      <span
        className={`text-sm font-medium ${isToday ? "text-[--primary]" : isSoon ? "text-orange-500" : ""}`}
        title={formatted}
      >
        {formatted}
      </span>
      <span className={`text-xs ${isToday ? "text-[--primary] font-semibold" : "text-[--muted-foreground]"}`}>
        ({label})
      </span>
    </div>
  );
}
