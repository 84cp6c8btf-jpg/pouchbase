import Link from "next/link";
import { ArrowDown, ArrowUp } from "lucide-react";
import {
  getBrand,
  getBurnDisplay,
  getCompareUrl,
  getPublicScoredProducts,
  getStrengthBurnContext,
  sortByBurn,
  type ProductWithBrand,
} from "@/lib/discovery";
import { getBurnLabel } from "@/lib/burn";

interface BurnLadderProps {
  products: ProductWithBrand[];
  currentSlug?: string;
  title?: string;
  description?: string;
  compact?: boolean;
  focus?: "mild" | "strong";
}

export function BurnLadder({
  products,
  currentSlug,
  title = "Burn ladder",
  description = "Move up or down the catalog by felt intensity rather than just brand or nicotine strength.",
  compact = false,
  focus = "mild",
}: BurnLadderProps) {
  const ladder = sortByBurn(getPublicScoredProducts(products));
  const currentIndex = currentSlug ? ladder.findIndex((product) => product.slug === currentSlug) : -1;
  const visible =
    currentIndex >= 0 && compact
      ? ladder.slice(Math.max(0, currentIndex - 2), currentIndex + 3)
      : compact
        ? focus === "strong"
          ? ladder.slice(Math.max(0, ladder.length - 8))
          : ladder.slice(0, 8)
        : ladder;

  if (visible.length === 0) {
    return (
      <section className="rounded-xl border border-white/8 bg-card p-5 sm:p-6">
        <div className="mb-5 max-w-2xl">
          <div className="text-[0.68rem] uppercase tracking-[0.18em] text-accent/85">Burn ladder</div>
          <h2 className="mt-2 font-display text-2xl font-bold text-white">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-white/54">{description}</p>
        </div>

        <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.02] px-4 py-5">
          <p className="text-sm leading-7 text-white/56">
            Not enough real public-score review data yet to build a trustworthy burn ladder. Once
            more products reach the structured-review threshold, step-up and step-down discovery
            will appear here.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-white/8 bg-card p-5 sm:p-6">
      <div className="mb-5 max-w-2xl">
        <div className="text-[0.68rem] uppercase tracking-[0.18em] text-accent/85">Burn ladder</div>
        <h2 className="mt-2 font-display text-2xl font-bold text-white">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-white/54">{description}</p>
      </div>

      <div className="space-y-3">
        {visible.map((product) => {
          const brand = getBrand(product);
          const current = product.slug === currentSlug;
          const burnContext = getStrengthBurnContext(product, ladder);

          return (
            <div
              key={product.id}
              className={`rounded-lg border p-4 ${
                current ? "border-accent/30 bg-accent/8" : "border-white/8 bg-white/[0.03]"
              }`}
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[0.68rem] uppercase tracking-[0.14em] text-white/40">
                      {brand?.name}
                    </span>
                    <span className="text-[0.68rem] uppercase tracking-[0.14em] text-white/28">
                      {getBurnLabel(product.avg_burn)}
                    </span>
                    {current && (
                      <span className="rounded-md border border-accent/20 bg-accent/10 px-2 py-0.5 text-[0.68rem] uppercase tracking-[0.14em] text-accent">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="mt-1 font-display text-xl font-bold text-white">{product.name}</div>
                  <p className="mt-2 text-sm leading-6 text-white/50">
                    {product.flavor} · {product.strength_mg}mg · {getBurnDisplay(product)}
                  </p>
                  {burnContext && <p className="mt-1 text-sm text-white/42">{burnContext}</p>}
                </div>

                <div className="flex flex-wrap gap-2">
                  {currentIndex >= 0 && product.avg_burn < ladder[currentIndex]?.avg_burn && (
                    <span className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2.5 py-1 text-xs text-white/48">
                      <ArrowDown className="h-3 w-3" />
                      Step down
                    </span>
                  )}
                  {currentIndex >= 0 && product.avg_burn > ladder[currentIndex]?.avg_burn && (
                    <span className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2.5 py-1 text-xs text-white/48">
                      <ArrowUp className="h-3 w-3" />
                      Step up
                    </span>
                  )}
                  <Link
                    href={`/pouches/${product.slug}`}
                    className="rounded-md border border-white/10 px-3 py-1.5 text-sm text-white/52 transition hover:text-white"
                  >
                    View
                  </Link>
                  {currentSlug && product.slug !== currentSlug && (
                    <Link
                      href={getCompareUrl(currentSlug, product.slug)}
                      className="rounded-md bg-accent px-3 py-1.5 text-sm font-semibold text-black transition hover:bg-accent-hover"
                    >
                      Compare
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
