import Link from "next/link";
import {
  getBrand,
  getBurnDisplay,
  getCompareUrl,
  type DiscoveryGroup,
} from "@/lib/catalog/discovery";

interface RelatedComparisonsProps {
  currentSlug: string;
  groups: DiscoveryGroup[];
}

export function RelatedComparisons({ currentSlug, groups }: RelatedComparisonsProps) {
  if (groups.length === 0) return null;

  return (
    <section className="space-y-5">
      <div>
        <div className="text-[0.68rem] uppercase tracking-[0.18em] text-accent/85">Compare nearby</div>
        <h2 className="mt-2 font-display text-3xl font-bold text-white">Closest next steps</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/54">
          Discovery suggestions derived from catalog facts first, then public burn and score relationships where enough data exists.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {groups.map((group) => (
          <section key={group.key} className="rounded-xl border border-white/8 bg-card p-5">
            <h3 className="font-display text-xl font-bold text-white">{group.title}</h3>
            <p className="mt-2 text-sm leading-6 text-white/50">{group.description}</p>
            <div className="mt-4 space-y-3">
              {group.products.map((product) => {
                const brand = getBrand(product);
                return (
                  <div key={product.id} className="rounded-lg border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[0.68rem] uppercase tracking-[0.14em] text-white/40">
                          {brand?.name}
                        </div>
                        <div className="mt-1 font-display text-lg font-bold text-white">{product.name}</div>
                        <p className="mt-2 text-sm leading-6 text-white/50">
                          {product.flavor} · {product.strength_mg}mg · {getBurnDisplay(product)}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Link
                          href={`/pouches/${product.slug}`}
                          className="rounded-md border border-white/10 px-3 py-1.5 text-sm text-white/52 transition hover:text-white"
                        >
                          View
                        </Link>
                        <Link
                          href={getCompareUrl(currentSlug, product.slug)}
                          className="rounded-md bg-accent px-3 py-1.5 text-sm font-semibold text-black transition hover:bg-accent-hover"
                        >
                          Compare
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
