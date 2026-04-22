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
  format,
  imageUrl,
  size = "card",
}: ProductArtworkProps) {
  const isHero = size === "hero";

  if (imageUrl) {
    return (
      <div className={isHero ? "h-48 w-full shrink-0 sm:w-48" : "h-20 w-full"}>
        <img src={imageUrl} alt={name} className="w-full h-full object-cover rounded-lg" />
      </div>
    );
  }

  const bg = getBg(`${brandSlug || brand || name}-${flavor}`, flavorCategory);

  return (
    <div
      className={`relative overflow-hidden rounded-lg ${
        isHero ? "h-48 w-full shrink-0 sm:w-48" : "h-20 w-full"
      }`}
      style={bg}
    >
      <div className="absolute inset-0 bg-black/14" />
      {isHero ? (
        <div className="relative flex h-full flex-col justify-between p-3.5">
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-medium uppercase tracking-wider text-white/56">
              {brand || "Pouch"}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-white/56">
              {flavor}
            </span>
          </div>

          <div>
            <div className="font-display text-4xl font-bold leading-none text-white">
              {strengthMg}<span className="text-lg text-white/56">mg</span>
            </div>
            <div className="mt-1 line-clamp-2 text-sm leading-tight text-white/76">
              {name}
            </div>
          </div>
        </div>
      ) : (
        <div className="relative flex h-full flex-col justify-between p-3">
          <div className="flex items-start justify-between gap-3 text-[10px] font-medium uppercase tracking-[0.16em] text-white/52">
            <span>{flavorCategory || brand || "Pouch"}</span>
            <span>{format || "Slim"}</span>
          </div>
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-white/88">{flavor}</div>
              <div className="truncate text-xs text-white/52">{brand || "Nicotine pouch"}</div>
            </div>
            <div className="shrink-0 text-sm font-semibold text-white/70">{strengthMg}mg</div>
          </div>
        </div>
      )}
    </div>
  );
}
