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

const CATEGORY_COLORS: Record<string, [string, string]> = {
  mint: ["#0c2d3f", "#1a6b7a"],
  fruit: ["#2d0f1f", "#7a1a3a"],
  coffee: ["#2d1a0c", "#6b3a10"],
  tobacco: ["#251510", "#5a2d12"],
  other: ["#151028", "#3a1d6b"],
};

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getBg(seed: string, flavorCategory?: string | null) {
  const fallbacks: [string, string][] = [
    ["#1f1612", "#5a2d12"],
    ["#101828", "#1d3a6b"],
    ["#1a1325", "#3d1d6b"],
  ];
  const colors =
    (flavorCategory && CATEGORY_COLORS[flavorCategory]) ||
    fallbacks[hashString(seed) % fallbacks.length];

  return {
    background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`,
  };
}

export function ProductArtwork({
  brand,
  brandSlug,
  name,
  flavor,
  flavorCategory,
  strengthMg,
  imageUrl,
  size = "card",
}: ProductArtworkProps) {
  if (imageUrl) {
    return (
      <div className={size === "hero" ? "w-full sm:w-48 h-48 shrink-0" : "w-full h-36"}>
        <img src={imageUrl} alt={name} className="w-full h-full object-cover rounded-lg" />
      </div>
    );
  }

  const bg = getBg(`${brandSlug || brand || name}-${flavor}`, flavorCategory);
  const isHero = size === "hero";

  return (
    <div
      className={`relative overflow-hidden rounded-lg ${
        isHero ? "w-full sm:w-48 h-48 shrink-0" : "w-full h-36"
      }`}
      style={bg}
    >
      <div className="relative h-full flex flex-col justify-between p-3.5">
        <div className="flex items-start justify-between">
          <span className="text-[10px] font-medium uppercase tracking-wider text-white/50">
            {brand || "Pouch"}
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-white/50">
            {flavor}
          </span>
        </div>

        <div>
          <div className={`font-display font-bold text-white leading-none ${isHero ? "text-4xl" : "text-3xl"}`}>
            {strengthMg}<span className="text-lg text-white/50">mg</span>
          </div>
          <div className="mt-1 text-sm font-medium text-white/70 leading-tight line-clamp-2">
            {name}
          </div>
        </div>
      </div>
    </div>
  );
}
