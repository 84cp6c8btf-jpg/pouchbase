interface RatingBadgeProps {
  label: string;
  value: number;
  size?: "sm" | "md";
}

function getColor(rating: number) {
  if (rating <= 3) return "text-red-300";
  if (rating <= 5) return "text-amber-300";
  if (rating <= 7) return "text-emerald-300";
  return "text-emerald-200";
}

export function RatingBadge({ label, value, size = "md" }: RatingBadgeProps) {
  const rounded = Math.round(value * 10) / 10;
  const compact = size === "sm";

  return (
    <div className={compact ? "px-2 py-1.5" : "px-3 py-2"}>
      <div className={`text-white/46 ${compact ? "text-[0.65rem]" : "text-xs"} uppercase tracking-[0.14em]`}>
        {label}
      </div>
      <div className={`font-display font-bold ${compact ? "text-lg" : "text-2xl"} ${getColor(rounded)}`}>
        {rounded > 0 ? rounded.toFixed(1) : "—"}
      </div>
    </div>
  );
}
