type BrandArtworkProps = {
  name: string;
  slug?: string | null;
  country?: string | null;
  logoUrl?: string | null;
  size?: "card" | "hero";
};

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getBrandBackground(seed: string) {
  const sets = [
    ["#171114", "#7c2d12", "#f97316", "rgba(249,115,22,0.30)"],
    ["#0f172a", "#1d4ed8", "#60a5fa", "rgba(96,165,250,0.24)"],
    ["#15121e", "#6d28d9", "#c084fc", "rgba(192,132,252,0.24)"],
    ["#132018", "#166534", "#4ade80", "rgba(74,222,128,0.24)"],
  ];
  const set = sets[hashString(seed) % sets.length];
  return {
    background: `radial-gradient(circle at top right, ${set[3]} 0%, transparent 34%), linear-gradient(145deg, ${set[0]} 0%, ${set[1]} 58%, ${set[2]} 100%)`,
    borderColor: `${set[2]}33`,
  };
}

export function BrandArtwork({ name, slug, country, logoUrl, size = "card" }: BrandArtworkProps) {
  if (logoUrl) {
    return (
      <div className={size === "hero" ? "w-24 h-24 sm:w-28 sm:h-28" : "w-14 h-14"}>
        <img src={logoUrl} alt={name} className="w-full h-full object-cover rounded-2xl border border-border" />
      </div>
    );
  }

  const isHero = size === "hero";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border shrink-0 ${isHero ? "w-24 h-24 sm:w-28 sm:h-28" : "w-14 h-14"}`}
      style={getBrandBackground(slug || name)}
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.06),transparent_30%,rgba(0,0,0,0.22))]" />
      <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-white/12 blur-xl" />
      <div className="relative h-full flex flex-col items-center justify-center">
        <div className={`${isHero ? "text-2xl" : "text-base"} font-black tracking-[0.18em] text-white`}>
          {getInitials(name)}
        </div>
        {isHero && (
          <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-white/70">
            {country || "Global"}
          </div>
        )}
      </div>
    </div>
  );
}
