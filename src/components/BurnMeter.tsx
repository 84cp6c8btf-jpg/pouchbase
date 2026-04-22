"use client";

import { Flame } from "lucide-react";

interface BurnMeterProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

function getLabel(rating: number) {
  if (rating < 2.5) return "Soft";
  if (rating < 4.5) return "Warm";
  if (rating < 6.5) return "Sharp";
  if (rating < 8.5) return "Intense";
  return "Inferno";
}

function getColor(rating: number) {
  if (rating < 2.5) return { text: "text-amber-300", bar: "bg-amber-400" };
  if (rating < 4.5) return { text: "text-orange-300", bar: "bg-orange-400" };
  if (rating < 6.5) return { text: "text-orange-400", bar: "bg-orange-500" };
  if (rating < 8.5) return { text: "text-red-400", bar: "bg-red-500" };
  return { text: "text-red-300", bar: "bg-red-400" };
}

export function BurnMeter({ rating, size = "md", showLabel = true }: BurnMeterProps) {
  const rounded = Math.round(rating * 10) / 10;
  const color = getColor(rounded);
  const width = `${Math.max(8, Math.min(100, rounded * 10))}%`;

  const compact = size === "sm";
  const large = size === "lg";

  return (
    <div className={`flex items-center gap-3 ${compact ? "gap-2" : ""}`}>
      <Flame className={`shrink-0 ${color.text} ${large ? "h-5 w-5" : "h-4 w-4"}`} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className={`font-display font-bold ${color.text} ${large ? "text-2xl" : compact ? "text-base" : "text-lg"}`}>
            {rounded.toFixed(1)}
          </span>
          <span className={`text-white/50 ${compact ? "text-xs" : "text-sm"}`}>
            / 10
          </span>
          {showLabel && (
            <span className={`text-white/50 ${compact ? "text-xs" : "text-sm"}`}>
              · {getLabel(rounded)}
            </span>
          )}
        </div>
        <div className={`mt-1.5 overflow-hidden rounded-full bg-white/8 ${large ? "h-2" : compact ? "h-1" : "h-1.5"}`}>
          <div className={`h-full rounded-full ${color.bar}`} style={{ width }} />
        </div>
      </div>
    </div>
  );
}
