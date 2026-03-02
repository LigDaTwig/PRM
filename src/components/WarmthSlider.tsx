"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

interface WarmthSliderProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

function getWarmthColor(value: number): string {
  // 0 = cold blue, 5 = neutral yellow, 10 = warm red
  if (value <= 2) return "#3b82f6"; // blue
  if (value <= 4) return "#6366f1"; // indigo
  if (value <= 6) return "#eab308"; // yellow
  if (value <= 8) return "#f97316"; // orange
  return "#ef4444"; // red
}

function getWarmthLabel(value: number): string {
  if (value <= 1) return "Cold";
  if (value <= 3) return "Cool";
  if (value <= 5) return "Neutral";
  if (value <= 7) return "Warm";
  if (value <= 9) return "Hot";
  return "On Fire";
}

export function WarmthSlider({ value, onChange, disabled }: WarmthSliderProps) {
  const color = getWarmthColor(value);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[--muted-foreground]">Warmth</span>
        <span
          className="text-sm font-semibold tabular-nums"
          style={{ color }}
        >
          {value}/10 — {getWarmthLabel(value)}
        </span>
      </div>
      <SliderPrimitive.Root
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          disabled && "opacity-50 pointer-events-none"
        )}
        min={0}
        max={10}
        step={1}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        disabled={disabled}
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-[--secondary]">
          <SliderPrimitive.Range
            className="absolute h-full rounded-full transition-colors"
            style={{ backgroundColor: color }}
          />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className="block h-5 w-5 rounded-full border-2 bg-white shadow transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--ring] disabled:pointer-events-none disabled:opacity-50"
          style={{ borderColor: color }}
        />
      </SliderPrimitive.Root>
      <div className="flex justify-between text-xs text-[--muted-foreground]">
        <span>0</span>
        <span>5</span>
        <span>10</span>
      </div>
    </div>
  );
}
