import Link from "next/link";
import { getBurnLabel } from "@/lib/burn";
import { getBrand, type ProductWithBrand } from "@/lib/discovery";

interface BurnRankSectionProps {
  eyebrow?: string;
  title: string;
  description: string;
  products: ProductWithBrand[];
}

export function BurnRankSection({
  eyebrow = "Burn Analysis",
  title,
  description,
  products,
}: BurnRankSectionProps) {
  if (products.length === 0) return null;

  return (
    <section className="rounded-xl border border-white/8 bg-card p-5 sm:p-6">
      <div className="max-w-2xl">
        <div className="text-[0.68rem] uppercase tracking-[0.18em] text-accent/85">
          {eyebrow}
        </div>
        <h2 className="mt-2 font-display text-2xl font-bold text-white">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-white/54">{description}</p>
      </div>

      <div className="mt-5 space-y-3">
        {products.map((product, index) => {
          const brand = getBrand(product);

          return (
            <Link
              key={product.id}
              href={`/pouches/${product.slug}`}
              className="grid gap-3 rounded-lg border border-white/8 bg-white/[0.03] p-4 transition hover:border-white/16 lg:grid-cols-[3rem_minmax(0,1fr)_5rem_5rem_5rem]"
            >
              <div className="font-display text-2xl font-bold text-white/24">
                {String(index + 1).padStart(2, "0")}
              </div>

              <div className="min-w-0">
                <div className="text-[0.68rem] uppercase tracking-[0.16em] text-white/38">
                  {brand?.name}
                </div>
                <div className="mt-1 font-display text-xl font-bold text-white">
                  {product.name}
                </div>
                <p className="mt-2 text-sm text-white/48">
                  {product.flavor} · {product.format} · {getBurnLabel(product.avg_burn)}
                </p>
              </div>

              <div>
                <div className="text-[0.66rem] uppercase tracking-[0.14em] text-white/34">Burn</div>
                <div className="mt-1 font-display text-2xl font-bold text-white">
                  {product.avg_burn.toFixed(1)}
                </div>
              </div>

              <div>
                <div className="text-[0.66rem] uppercase tracking-[0.14em] text-white/34">Overall</div>
                <div className="mt-1 font-display text-2xl font-bold text-white">
                  {product.avg_overall.toFixed(1)}
                </div>
              </div>

              <div>
                <div className="text-[0.66rem] uppercase tracking-[0.14em] text-white/34">Signal</div>
                <div className="mt-1 text-sm leading-6 text-white/56">
                  {product.strength_mg}mg · {product.review_count} reviews
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
