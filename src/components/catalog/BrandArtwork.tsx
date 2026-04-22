/* eslint-disable @next/next/no-img-element */

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
    { background: "#1b120d", border: "#ff7a1a33", accent: "#ffb27c" },
    { background: "#101722", border: "#60a5fa33", accent: "#c3ddff" },
    { background: "#18131f", border: "#c084fc33", accent: "#ebcfff" },
    { background: "#111912", border: "#4ade8033", accent: "#c7f7d7" },
  ];
  return sets[hashString(seed) % sets.length];
}

export function BrandArtwork({ name, slug, country, logoUrl, size = "card" }: BrandArtworkProps) {
  if (logoUrl) {
    return (
      <div className={size === "hero" ? "w-24 h-24 sm:w-28 sm:h-28" : "w-14 h-14"}>
        <img src={logoUrl} alt={name} className="w-full h-full object-cover rounded-xl border border-border" />
      </div>
    );
  }

  const isHero = size === "hero";
  const palette = getBrandBackground(slug || name);

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-xl border ${isHero ? "h-24 w-24 sm:h-28 sm:w-28" : "h-14 w-14"}`}
      style={{ background: palette.background, borderColor: palette.border }}
    >
      <div className="relative flex h-full flex-col items-center justify-center">
        <div
          className={`${isHero ? "text-2xl" : "text-base"} font-display font-bold tracking-[0.18em]`}
          style={{ color: palette.accent }}
        >
          {getInitials(name)}
        </div>
        {isHero && (
          <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-white/52">
            {country || "Global"}
          </div>
        )}
      </div>
    </div>
  );
}
