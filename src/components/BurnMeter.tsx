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

function getTone(rating: number) {
  if (rating < 2.5) {
    return {
      text: "text-amber-300",
      glow: "from-amber-300/25 via-amber-400/10 to-transparent",
      line: "from-amber-300 via-orange-400 to-orange-500",
      border: "border-amber-300/20",
    };
  }
  if (rating < 4.5) {
    return {
      text: "text-orange-300",
      glow: "from-orange-300/25 via-orange-500/12 to-transparent",
      line: "from-orange-300 via-orange-500 to-orange-500",
      border: "border-orange-300/20",
    };
  }
  if (rating < 6.5) {
    return {
      text: "text-orange-400",
      glow: "from-orange-400/28 via-orange-500/14 to-transparent",
      line: "from-orange-400 via-orange-500 to-red-500",
      border: "border-orange-400/20",
    };
  }
  if (rating < 8.5) {
    return {
      text: "text-red-400",
      glow: "from-red-400/30 via-orange-500/18 to-transparent",
      line: "from-orange-400 via-red-500 to-red-500",
      border: "border-red-400/20",
    };
  }
  return {
    text: "text-red-300",
    glow: "from-red-500/34 via-orange-500/20 to-transparent",
    line: "from-orange-400 via-red-500 to-rose-300",
    border: "border-red-500/25",
  };
}

const SIZE_STYLES = {
  sm: {
    shell: "gap-3 rounded-[1.25rem] px-3.5 py-3",
    badge: "h-9 min-w-9 text-sm",
    overline: "text-[0.6rem] tracking-[0.22em]",
    value: "text-base",
    label: "text-xs",
    rail: "h-1.5",
  },
  md: {
    shell: "gap-3 rounded-[1.4rem] px-4 py-3.5",
    badge: "h-10 min-w-10 text-base",
    overline: "text-[0.63rem] tracking-[0.24em]",
    value: "text-lg",
    label: "text-sm",
    rail: "h-2",
  },
  lg: {
    shell: "gap-4 rounded-[1.6rem] px-4 py-4 sm:px-5",
    badge: "h-12 min-w-12 text-lg",
    overline: "text-[0.68rem] tracking-[0.26em]",
    value: "text-2xl",
    label: "text-sm",
    rail: "h-2.5",
  },
};

export function BurnMeter({ rating, size = "md", showLabel = true }: BurnMeterProps) {
  const rounded = Math.round(rating * 10) / 10;
  const tone = getTone(rounded);
  const styles = SIZE_STYLES[size];
  const width = `${Math.max(8, Math.min(100, rounded * 10))}%`;

  return (
    <div
      className={`relative overflow-hidden border bg-white/[0.035] backdrop-blur-sm ${styles.shell} ${tone.border}`}
    >
      <div className={`absolute inset-x-0 top-0 h-full bg-gradient-to-r ${tone.glow}`} />
      <div className="relative flex items-center gap-3">
        <div
          className={`grid place-items-center rounded-full border border-white/10 bg-black/25 font-bold ${styles.badge} ${tone.text}`}
        >
          <Flame className={size === "sm" ? "h-4 w-4" : size === "md" ? "h-5 w-5" : "h-6 w-6"} />
        </div>

        <div className="min-w-0 flex-1">
          <div className={`mb-1 text-white/45 uppercase ${styles.overline}`}>
            Burn Index
          </div>
          <div className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className={`font-display font-bold ${styles.value} ${tone.text}`}>
              {rounded.toFixed(1)}
            </span>
            {showLabel && <span className={`text-white/72 ${styles.label}`}>{getLabel(rounded)}</span>}
          </div>
          <div className={`relative overflow-hidden rounded-full bg-white/8 ${styles.rail}`}>
            <div className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${tone.line}`} style={{ width }} />
          </div>
        </div>
      </div>
    </div>
  );
}
