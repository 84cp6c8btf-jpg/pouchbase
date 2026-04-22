import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ArrowRight, Globe, Layers } from "lucide-react";
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
    <div className="space-y-8">
      <section className="pb-editorial-panel px-6 py-7 sm:px-8 sm:py-8">
        <div className="relative z-10">
          <div className="pb-kicker mb-5">
            <Layers className="h-3.5 w-3.5" />
            All Brands
          </div>
          <h1 className="font-display text-[clamp(2.8rem,6vw,5.6rem)] font-bold leading-[0.92] text-white">
            Every brand we track.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-white/60">
            From ZYN and VELO to Pablo and Siberia. Pick a brand to see all their pouches,
            ratings, and reviews in one place.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {enrichedBrands.map((brand) => (
          <Link
            key={brand.id}
            href={`/brands/${brand.slug}`}
            className="pb-data-card group p-5 transition duration-300 hover:-translate-y-1 hover:border-accent/35"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <BrandArtwork name={brand.name} slug={brand.slug} country={brand.country} size="card" />
                <div>
                  <p className="mb-2 text-[0.68rem] uppercase tracking-[0.22em] text-white/40">
                    {brand.country || "Global"}
                  </p>
                  <h2 className="font-display text-[1.9rem] font-bold leading-[1] text-white transition group-hover:text-accent">
                    {brand.name}
                  </h2>
                </div>
              </div>
              <ArrowRight className="h-[1.125rem] w-[1.125rem] text-white/30 transition group-hover:text-accent" />
            </div>

            <p className="min-h-14 text-sm leading-7 text-white/56">
              {brand.description || `${brand.name} on PouchBase.`}
            </p>

            <div className="mt-5 flex flex-col gap-3 border-t border-white/8 pt-4 text-sm sm:flex-row sm:items-center sm:justify-between">
              <span className="inline-flex items-center gap-2 font-medium text-white">
                <Layers className="h-4 w-4 text-accent" />
                {brand.productCount} pouch{brand.productCount !== 1 ? "es" : ""}
              </span>
              {brand.website_url ? (
                <span className="inline-flex items-center gap-1 text-white/48">
                  <Globe className="h-4 w-4" />
                  Website
                </span>
              ) : (
                <span className="text-white/40">Profile</span>
              )}
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
