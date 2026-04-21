type ProductArtworkProps = {
  brand?: string | null;
  brandSlug?: string | null;
  name: string;
  flavor: string;
  flavorCategory?: string | null;
  strengthMg: number;
  format?: string | null;
  imageUrl?: string | null;
  size?: "card" | "hero";
};

const CATEGORY_COLORS: Record<string, [string, string, string, string]> = {
  mint: ["#0f172a", "#155e75", "#38bdf8", "rgba(56, 189, 248, 0.35)"],
  fruit: ["#2a0f1f", "#9f1239", "#fb7185", "rgba(251, 113, 133, 0.32)"],
  coffee: ["#27180f", "#78350f", "#f59e0b", "rgba(245, 158, 11, 0.28)"],
  tobacco: ["#221815", "#7c2d12", "#fb923c", "rgba(251, 146, 60, 0.28)"],
  other: ["#101522", "#4c1d95", "#a78bfa", "rgba(167, 139, 250, 0.28)"],
};

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function buildBackground(seed: string, flavorCategory?: string | null) {
  const fallbackSets = [
    ["#1f1612", "#7c2d12", "#f97316", "rgba(249, 115, 22, 0.32)"],
    ["#101828", "#1d4ed8", "#60a5fa", "rgba(96, 165, 250, 0.28)"],
    ["#1a1325", "#6d28d9", "#c084fc", "rgba(192, 132, 252, 0.28)"],
  ];
  const base =
    (flavorCategory && CATEGORY_COLORS[flavorCategory]) ||
    fallbackSets[hashString(seed) % fallbackSets.length];

  return {
    background: `radial-gradient(circle at top right, ${base[3]} 0%, transparent 34%), linear-gradient(145deg, ${base[0]} 0%, ${base[1]} 58%, ${base[2]} 100%)`,
    borderColor: `${base[2]}33`,
  };
}

function getStrengthLabel(strengthMg: number) {
  if (strengthMg >= 24) return "EXT";
  if (strengthMg >= 15) return "MAX";
  if (strengthMg >= 8) return "STR";
  return "MID";
}

export function ProductArtwork({
  brand,
  brandSlug,
  name,
  flavor,
  flavorCategory,
  strengthMg,
  format,
  imageUrl,
  size = "card",
}: ProductArtworkProps) {
  if (imageUrl) {
    return (
      <div className={size === "hero" ? "w-full sm:w-52 h-52 shrink-0" : "w-full h-40"}>
        <img src={imageUrl} alt={name} className="w-full h-full object-cover rounded-2xl border border-border" />
      </div>
    );
  }

  const bg = buildBackground(`${brandSlug || brand || name}-${flavor}`, flavorCategory);
  const isHero = size === "hero";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border shadow-[0_20px_60px_rgba(0,0,0,0.22)] ${
        isHero ? "w-full sm:w-52 h-52 shrink-0" : "w-full h-40"
      }`}
      style={bg}
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.06),transparent_25%,rgba(0,0,0,0.22))]" />
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute bottom-3 right-3 text-[10px] font-semibold tracking-[0.24em] text-white/40">
        POUCHBASE
      </div>
      <div className="relative h-full flex flex-col justify-between p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="rounded-full border border-white/15 bg-black/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/75">
            {brand || "Pouch"}
          </div>
          <div className="rounded-full border border-white/15 bg-black/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/75">
            {format || "slim"}
          </div>
        </div>

        <div>
          <div className={`${isHero ? "text-5xl" : "text-4xl"} font-black tracking-tight text-white leading-none`}>
            {getStrengthLabel(strengthMg)}
          </div>
          <div className="mt-2 text-xs uppercase tracking-[0.22em] text-white/70">
            {flavor}
          </div>
        </div>

        <div>
          <div className={`${isHero ? "text-base" : "text-sm"} font-semibold text-white/95 leading-tight line-clamp-2`}>
            {name}
          </div>
          <div className="mt-2 inline-flex items-center rounded-full bg-black/25 px-2.5 py-1 text-[11px] font-medium text-white/85">
            {strengthMg}mg strength
          </div>
        </div>
      </div>
    </div>
  );
}
