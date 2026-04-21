interface RatingBadgeProps {
  label: string;
  value: number;
  size?: "sm" | "md";
}

function getTone(rating: number) {
  if (rating <= 3) return "text-red-300";
  if (rating <= 5) return "text-amber-300";
  if (rating <= 7) return "text-emerald-300";
  return "text-emerald-200";
}

export function RatingBadge({ label, value, size = "md" }: RatingBadgeProps) {
  const rounded = Math.round(value * 10) / 10;
  const compact = size === "sm";

  return (
    <div
      className={`rounded-2xl border border-white/8 bg-white/[0.035] ${
        compact ? "min-w-[4.4rem] px-3 py-2.5" : "min-w-[5.5rem] px-3.5 py-3"
      }`}
    >
      <div className={`text-white/52 ${compact ? "text-[0.68rem]" : "text-[0.72rem]"} uppercase tracking-[0.18em]`}>
        {label}
      </div>
      <div className={`mt-1 font-display font-bold ${compact ? "text-xl" : "text-2xl"} ${getTone(rounded)}`}>
        {rounded > 0 ? rounded.toFixed(1) : "—"}
      </div>
    </div>
  );
}
