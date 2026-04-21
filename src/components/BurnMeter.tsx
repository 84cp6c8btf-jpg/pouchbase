"use client";

import { Flame } from "lucide-react";

interface BurnMeterProps {
  rating: number; // 0-10
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function BurnMeter({ rating, size = "md", showLabel = true }: BurnMeterProps) {
  const rounded = Math.round(rating * 10) / 10;

  const getColor = (r: number) => {
    if (r <= 3) return "text-yellow-400";
    if (r <= 5) return "text-orange-400";
    if (r <= 7) return "text-orange-500";
    if (r <= 9) return "text-red-500";
    return "text-red-600";
  };

  const getBgColor = (r: number) => {
    if (r <= 3) return "bg-yellow-400/20";
    if (r <= 5) return "bg-orange-400/20";
    if (r <= 7) return "bg-orange-500/20";
    if (r <= 9) return "bg-red-500/20";
    return "bg-red-600/20";
  };

  const getLabel = (r: number) => {
    if (r <= 2) return "Mild";
    if (r <= 4) return "Moderate";
    if (r <= 6) return "Spicy";
    if (r <= 8) return "Intense";
    return "Inferno";
  };

  const sizes = {
    sm: { flame: "w-3 h-3", text: "text-xs", badge: "px-1.5 py-0.5" },
    md: { flame: "w-4 h-4", text: "text-sm", badge: "px-2 py-1" },
    lg: { flame: "w-6 h-6", text: "text-base", badge: "px-3 py-1.5" },
  };

  const s = sizes[size];

  return (
    <div className={`inline-flex items-center gap-1.5 ${getBgColor(rounded)} ${s.badge} rounded-full`}>
      <Flame className={`${s.flame} ${getColor(rounded)}`} />
      <span className={`${s.text} font-bold ${getColor(rounded)}`}>
        {rounded.toFixed(1)}
      </span>
      {showLabel && (
        <span className={`${s.text} text-muted`}>{getLabel(rounded)}</span>
      )}
    </div>
  );
}
