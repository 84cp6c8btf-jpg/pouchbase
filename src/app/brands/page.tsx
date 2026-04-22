import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ArrowRight, Globe } from "lucide-react";
import type { Metadata } from "next";
import { BrandArtwork } from "@/components/BrandArtwork";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Nicotine Pouch Brands — PouchBase",
  description: "Browse nicotine pouch brands, compare catalogs, and discover what each brand is known for.",
  alternates: {
    canonical: "/brands",
  },
};

type BrandRow = {
  id: string;
  name: string;
  slug: string;
  country: string | null;
  description: string | null;
  website_url: string | null;
};

export default async function BrandsPage() {
  const [{ data: brands }, { data: products }] = await Promise.all([
    supabase.from("brands").select("id, name, slug, country, description, website_url").order("name"),
    supabase.from("products").select("brand_id"),
  ]);

  const counts = new Map<string, number>();
  for (const product of products || []) {
    counts.set(product.brand_id, (counts.get(product.brand_id) || 0) + 1);
  }

  const enrichedBrands = ((brands || []) as BrandRow[])
    .map((brand) => ({
      ...brand,
      productCount: counts.get(brand.id) || 0,
    }))
    .sort((a, b) => b.productCount - a.productCount || a.name.localeCompare(b.name));

  return (
    <div className="space-y-6">
      <section className="pt-2 sm:pt-6">
        <h1 className="font-display text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-[0.92] text-white">
          Every brand we track.
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-white/45">
          From ZYN and VELO to Pablo and Siberia. Pick a brand to see all their pouches,
          ratings, and reviews in one place.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {enrichedBrands.map((brand) => (
          <Link
            key={brand.id}
            href={`/brands/${brand.slug}`}
            className="group flex items-start gap-4 rounded-xl border border-white/8 bg-[#111114] p-5 transition hover:border-white/16"
          >
            <BrandArtwork name={brand.name} slug={brand.slug} country={brand.country} size="card" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-white/35">{brand.country || "Global"}</p>
                  <h2 className="font-display text-xl font-bold text-white group-hover:text-accent transition-colors">
                    {brand.name}
                  </h2>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-white/20 group-hover:text-accent transition-colors" />
              </div>
              <p className="mt-2 text-sm leading-relaxed text-white/40 line-clamp-2">
                {brand.description || `${brand.name} nicotine pouches.`}
              </p>
              <div className="mt-3 flex items-center gap-3 text-sm">
                <span className="text-white/50">
                  {brand.productCount} pouch{brand.productCount !== 1 ? "es" : ""}
                </span>
                {brand.website_url && (
                  <span className="inline-flex items-center gap-1 text-white/30">
                    <Globe className="h-3 w-3" />
                    Website
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
