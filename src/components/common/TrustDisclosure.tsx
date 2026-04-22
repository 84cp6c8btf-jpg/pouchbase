import { ListOrdered, MessageSquare, ShieldCheck, Store } from "lucide-react";
import { MIN_PUBLIC_SCORE_REVIEWS } from "@/lib/catalog/burn";

interface TrustDisclosureProps {
  context?: "discovery" | "ranking" | "product";
}

const COPY = {
  discovery: {
    eyebrow: "Trust Signals",
    title: "Built to compare, not to sell.",
    items: [
      {
        icon: ListOrdered,
        label: "Rankings follow structured ratings",
        description:
          "Burn, flavor, longevity, and overall are collected as review fields rather than loose testimonials.",
      },
      {
        icon: Store,
        label: "Prices come from external shops",
        description:
          "PouchBase does not sell pouches. Shop availability and prices can change independently of the directory.",
      },
      {
        icon: ShieldCheck,
        label: "Retail links stay separate",
        description:
          "Affiliate or retailer relationships never change burn scores, review summaries, or product order.",
      },
    ],
  },
  ranking: {
    eyebrow: "Ranking Logic",
    title: "How ranking data is kept credible.",
    items: [
      {
        icon: ListOrdered,
        label: "Structured ratings decide placement",
        description:
          "Rankings use the burn/flavor/longevity/overall fields from review data, not retailer claims or promotional placement.",
      },
      {
        icon: MessageSquare,
        label: `Public scores need ${MIN_PUBLIC_SCORE_REVIEWS}+ reviews`,
        description:
          "Products only become rank-eligible once they have enough review volume to avoid looking falsely precise.",
      },
      {
        icon: ShieldCheck,
        label: "Retail links do not affect order",
        description:
          "Outbound shop links can support the site, but they do not influence Top Rated or Highest Burn positions.",
      },
    ],
  },
  product: {
    eyebrow: "Method & Trust",
    title: "How this product data is handled.",
    items: [
      {
        icon: MessageSquare,
        label: "Scores come from structured reviews",
        description:
          "Burn, flavor, longevity, and overall are individual review fields so the public score is built from consistent inputs.",
      },
      {
        icon: ListOrdered,
        label: `Public score unlocks at ${MIN_PUBLIC_SCORE_REVIEWS}+ reviews`,
        description:
          "Until a pouch has enough rating volume, PouchBase treats the signal as early and avoids presenting it like settled authority.",
      },
      {
        icon: Store,
        label: "Retail pricing stays separate",
        description:
          "Prices are pulled from external shops, and retailer relationships never affect the score or ranking status of this pouch.",
      },
    ],
  },
} as const;

export function TrustDisclosure({ context = "ranking" }: TrustDisclosureProps) {
  const config = COPY[context];

  return (
    <section className="rounded-xl border border-white/8 bg-card p-5 sm:p-6">
      <div className="max-w-2xl">
        <p className="mb-3 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-accent/85">
          {config.eyebrow}
        </p>
        <h2 className="font-display text-2xl font-bold text-white">{config.title}</h2>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        {config.items.map(({ icon: Icon, label, description }) => (
          <div key={label} className="rounded-lg border border-white/8 bg-white/[0.03] p-4">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-white">
              <Icon className="h-4 w-4 text-accent" />
              {label}
            </div>
            <p className="mt-2 text-sm leading-6 text-white/52">{description}</p>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs leading-6 text-white/40">
        Adult-use reference product only. Nicotine is addictive.
      </p>
    </section>
  );
}
