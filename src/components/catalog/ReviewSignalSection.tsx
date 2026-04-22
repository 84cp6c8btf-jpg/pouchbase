import Link from "next/link";
import { ArrowRight, MessageSquare } from "lucide-react";
import { ProductCard } from "@/components/catalog/ProductCard";
import type { ProductWithBrand } from "@/lib/catalog/discovery";

interface ReviewSignalSectionProps {
  eyebrow?: string;
  title: string;
  description: string;
  products: ProductWithBrand[];
  href?: string;
  hrefLabel?: string;
}

export function ReviewSignalSection({
  eyebrow = "Review Activity",
  title,
  description,
  products,
  href,
  hrefLabel,
}: ReviewSignalSectionProps) {
  if (products.length === 0) return null;

  return (
    <section>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.18em] text-accent/85">
            <MessageSquare className="h-3.5 w-3.5" />
            {eyebrow}
          </div>
          <h2 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/54">{description}</p>
        </div>
        {href && hrefLabel && (
          <Link
            href={href}
            className="shrink-0 inline-flex items-center gap-1 text-sm text-white/45 transition hover:text-accent"
          >
            {hrefLabel} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
