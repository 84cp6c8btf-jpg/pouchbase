import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Layers, ArrowRight, Globe } from "lucide-react";
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
      <section className="bg-card border border-border rounded-2xl p-6 sm:p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-accent mb-3">Brand Directory</p>
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Browse Nicotine Pouch Brands</h1>
        <p className="text-muted max-w-3xl">
          Explore the brands behind the most talked-about nicotine pouches, from mainstream mint staples
          to high-burn cult favorites.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {enrichedBrands.map((brand) => (
          <Link
            key={brand.id}
            href={`/brands/${brand.slug}`}
            className="bg-card border border-border rounded-2xl p-5 hover:border-accent/50 hover:bg-card-hover transition-all group"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-start gap-4">
                <BrandArtwork name={brand.name} slug={brand.slug} country={brand.country} size="card" />
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted mb-2">{brand.country || "Global"}</p>
                  <h2 className="text-2xl font-semibold group-hover:text-accent transition-colors">{brand.name}</h2>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted group-hover:text-accent transition-colors shrink-0" />
            </div>

            <p className="text-sm text-muted mb-5 min-h-12">
              {brand.description || `${brand.name} on PouchBase.`}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm border-t border-border pt-4">
              <span className="inline-flex items-center gap-2 text-foreground font-medium">
                <Layers className="w-4 h-4 text-accent" />
                {brand.productCount} pouch{brand.productCount !== 1 ? "es" : ""}
              </span>
              {brand.website_url ? (
                <span className="inline-flex items-center gap-1 text-muted">
                  <Globe className="w-4 h-4" />
                  Website
                </span>
              ) : (
                <span className="text-muted">Profile</span>
              )}
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
