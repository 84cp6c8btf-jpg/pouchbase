interface RatingBadgeProps {
  label: string;
  value: number;
  size?: "sm" | "md";
}

export function RatingBadge({ label, value, size = "md" }: RatingBadgeProps) {
  const rounded = Math.round(value * 10) / 10;

  const getColor = (r: number) => {
    if (r <= 3) return "text-red-400";
    if (r <= 5) return "text-yellow-400";
    if (r <= 7) return "text-green-400";
    return "text-emerald-400";
  };

  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className={`${textSize} text-muted`}>{label}</span>
      <span className={`${size === "sm" ? "text-sm" : "text-lg"} font-bold ${getColor(rounded)}`}>
        {rounded > 0 ? rounded.toFixed(1) : "—"}
      </span>
    </div>
  );
}
