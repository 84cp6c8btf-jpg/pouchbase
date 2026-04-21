import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ProductCard } from "@/components/ProductCard";
import { Flame, Globe, Layers, Star } from "lucide-react";
import type { Metadata } from "next";
import { BrandArtwork } from "@/components/BrandArtwork";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: brand } = await supabase
    .from("brands")
    .select("name, description")
    .eq("slug", slug)
    .single();

  if (!brand) return { title: "Brand Not Found" };

  return {
    title: `${brand.name} Nicotine Pouches — PouchBase`,
    description: brand.description || `Browse ${brand.name} nicotine pouches, ratings, burn scores, and pricing.`,
    alternates: {
      canonical: `/brands/${slug}`,
    },
  };
}

export default async function BrandDetailPage({ params }: Props) {
  const { slug } = await params;

  const { data: brand } = await supabase
    .from("brands")
    .select("id, name, slug, country, description, website_url")
    .eq("slug", slug)
    .single();

  if (!brand) notFound();

  const { data: products } = await supabase
    .from("products")
    .select("*, brands(name, slug)")
    .eq("brand_id", brand.id)
    .order("avg_overall", { ascending: false });

  const brandProducts = products || [];
  const reviewedProducts = brandProducts.filter((product) => product.review_count > 0);
  const avgOverall =
    reviewedProducts.length > 0
      ? reviewedProducts.reduce((sum, product) => sum + Number(product.avg_overall || 0), 0) / reviewedProducts.length
      : 0;
  const avgBurn =
    reviewedProducts.length > 0
      ? reviewedProducts.reduce((sum, product) => sum + Number(product.avg_burn || 0), 0) / reviewedProducts.length
      : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-2 text-sm text-white/42">
        <Link href="/brands" className="transition hover:text-white">
          Brands
        </Link>
        <span>/</span>
        <span className="text-white/68">{brand.name}</span>
      </div>

      <section className="pb-editorial-panel p-6 sm:p-8">
        <div className="relative z-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-end">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <BrandArtwork name={brand.name} slug={brand.slug} country={brand.country} size="hero" />
              <div>
                <div className="pb-kicker mb-4">{brand.country || "Global Brand"}</div>
                <h1 className="font-display text-[clamp(2.8rem,5vw,4.8rem)] font-bold leading-[0.92] text-white">
                  {brand.name}
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-8 text-white/60">
                  {brand.description || `${brand.name} nicotine pouches listed on PouchBase.`}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="pb-stat-tile">
                <div className="text-[0.66rem] uppercase tracking-[0.22em] text-white/38">Products</div>
                <div className="mt-1 inline-flex items-center gap-2 font-display text-4xl font-bold text-white">
                  <Layers className="h-5 w-5 text-accent" />
                  {brandProducts.length}
                </div>
              </div>
              <div className="pb-stat-tile">
                <div className="text-[0.66rem] uppercase tracking-[0.22em] text-white/38">Average Overall</div>
                <div className="mt-1 inline-flex items-center gap-2 font-display text-4xl font-bold text-emerald-200">
                  <Star className="h-5 w-5 text-accent" />
                  {avgOverall ? avgOverall.toFixed(1) : "N/A"}
                </div>
              </div>
              <div className="pb-stat-tile">
                <div className="text-[0.66rem] uppercase tracking-[0.22em] text-white/38">Average Burn</div>
                <div className="mt-1 inline-flex items-center gap-2 font-display text-4xl font-bold text-white">
                  <Flame className="h-5 w-5 text-accent" />
                  {avgBurn ? avgBurn.toFixed(1) : "N/A"}
                </div>
              </div>
              {brand.website_url && (
                <a
                  href={brand.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-accent"
                >
                  <Globe className="h-4 w-4" />
                  Visit brand site
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {brandProducts.length > 0 ? (
        <section className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-[0.66rem] uppercase tracking-[0.22em] text-white/38">Catalog</div>
              <h2 className="mt-1 font-display text-4xl font-bold text-white">All {brand.name} pouches</h2>
            </div>
            <Link href="/pouches" className="text-sm text-white/60 transition hover:text-accent">
              Browse all pouches
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {brandProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : (
        <section className="pb-editorial-panel px-6 py-10 text-center">
          <div className="relative z-10">
            <h2 className="font-display text-4xl font-bold text-white">No products listed yet</h2>
            <p className="mt-4 text-white/58">This brand profile exists, but its catalog has not been added yet.</p>
          </div>
        </section>
      )}
    </div>
  );
}
