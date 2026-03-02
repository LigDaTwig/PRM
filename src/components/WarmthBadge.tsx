interface WarmthBadgeProps {
  value: number;
}

function getWarmthColor(value: number): string {
  if (value <= 2) return "#3b82f6";
  if (value <= 4) return "#6366f1";
  if (value <= 6) return "#eab308";
  if (value <= 8) return "#f97316";
  return "#ef4444";
}

export function WarmthBadge({ value }: WarmthBadgeProps) {
  const color = getWarmthColor(value);
  const pct = (value / 10) * 100;

  return (
    <div className="flex items-center gap-2 min-w-[80px]">
      <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span
        className="text-xs font-semibold tabular-nums w-4 text-right"
        style={{ color }}
      >
        {value}
      </span>
    </div>
  );
}
