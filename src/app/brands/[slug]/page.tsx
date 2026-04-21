import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ProductCard } from "@/components/ProductCard";
import { Flame, Globe, Layers, Star } from "lucide-react";
import type { Metadata } from "next";

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
      <div className="text-sm text-muted">
        <Link href="/brands" className="hover:text-foreground transition-colors">
          Brands
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{brand.name}</span>
      </div>

      <section className="bg-card border border-border rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-accent mb-3">{brand.country || "Global Brand"}</p>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">{brand.name}</h1>
            <p className="text-muted max-w-3xl">
              {brand.description || `${brand.name} nicotine pouches listed on PouchBase.`}
            </p>
          </div>

          {brand.website_url && (
            <a
              href={brand.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent-hover"
            >
              <Globe className="w-4 h-4" />
              Visit brand site
            </a>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          <div className="bg-zinc-900/60 rounded-xl border border-border p-4">
            <p className="text-xs uppercase tracking-wide text-muted mb-2">Products</p>
            <p className="text-2xl font-bold inline-flex items-center gap-2">
              <Layers className="w-5 h-5 text-accent" />
              {brandProducts.length}
            </p>
          </div>
          <div className="bg-zinc-900/60 rounded-xl border border-border p-4">
            <p className="text-xs uppercase tracking-wide text-muted mb-2">Average Overall</p>
            <p className="text-2xl font-bold inline-flex items-center gap-2">
              <Star className="w-5 h-5 text-accent" />
              {avgOverall ? avgOverall.toFixed(1) : "N/A"}
            </p>
          </div>
          <div className="bg-zinc-900/60 rounded-xl border border-border p-4">
            <p className="text-xs uppercase tracking-wide text-muted mb-2">Average Burn</p>
            <p className="text-2xl font-bold inline-flex items-center gap-2">
              <Flame className="w-5 h-5 text-accent" />
              {avgBurn ? avgBurn.toFixed(1) : "N/A"}
            </p>
          </div>
        </div>
      </section>

      {brandProducts.length > 0 ? (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">All {brand.name} Pouches</h2>
            <Link href="/pouches" className="text-sm text-accent hover:text-accent-hover">
              Browse all pouches
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {brandProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : (
        <section className="bg-card border border-border rounded-2xl p-8 text-center">
          <p className="text-muted">No products listed for this brand yet.</p>
        </section>
      )}
    </div>
  );
}
