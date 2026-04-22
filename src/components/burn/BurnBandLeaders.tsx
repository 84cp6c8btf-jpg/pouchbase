import Link from "next/link";
import { getBurnScaleEntry } from "@/lib/catalog/burn";
import { getBrand, type ProductWithBrand } from "@/lib/catalog/discovery";

type BurnBandLeader = {
  key: string;
  title: string;
  description: string;
  products: ProductWithBrand[];
};

interface BurnBandLeadersProps {
  bands: BurnBandLeader[];
}

export function BurnBandLeaders({ bands }: BurnBandLeadersProps) {
  if (bands.length === 0) return null;

  return (
    <section className="rounded-xl border border-white/8 bg-card p-5 sm:p-6">
      <div className="max-w-2xl">
        <div className="text-[0.68rem] uppercase tracking-[0.18em] text-accent/85">
          Burn Bands
        </div>
        <h2 className="mt-2 font-display text-2xl font-bold text-white">
          Best-rated picks inside each burn band
        </h2>
        <p className="mt-2 text-sm leading-6 text-white/54">
          Burn works best as a browsing axis when users can see the strongest option inside each intensity lane, not only the absolute hottest products.
        </p>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
        {bands.map((band) => {
          const leader = band.products[0];
          if (!leader) return null;

          const brand = getBrand(leader);
          const scale = getBurnScaleEntry(leader.avg_burn);

          return (
            <Link
              key={band.key}
              href={`/pouches/${leader.slug}`}
              className="rounded-lg border border-white/8 bg-white/[0.03] p-4 transition hover:border-white/16"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-[0.68rem] uppercase tracking-[0.16em] text-white/38">
                  {band.title}
                </div>
                <span className={`text-sm ${scale.textClass}`}>{scale.label}</span>
              </div>
              <div className="mt-2 font-display text-xl font-bold text-white">{leader.name}</div>
              <p className="mt-1 text-sm text-white/48">
                {brand?.name} · {leader.flavor} · {leader.strength_mg}mg
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/56">
                <span>Overall {leader.avg_overall.toFixed(1)}</span>
                <span>Burn {leader.avg_burn.toFixed(1)}</span>
                <span>{leader.review_count} reviews</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
