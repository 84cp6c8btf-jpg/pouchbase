import { Flame } from "lucide-react";
import { formatBurnRating, getBurnLabel, getBurnUiTone } from "@/lib/burn";

interface BurnMeterProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function BurnMeter({ rating, size = "md", showLabel = true }: BurnMeterProps) {
  const rounded = Number(formatBurnRating(rating));
  const color = getBurnUiTone(rounded);
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
          <span className={`text-white/58 ${compact ? "text-xs" : "text-sm"}`}>
            / 10
          </span>
          {showLabel && (
            <span className={`text-white/58 ${compact ? "text-xs" : "text-sm"}`}>
              · {getBurnLabel(rounded)}
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
