import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { getSiteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const [{ data: products }, { data: brands }] = await Promise.all([
    supabase.from("products").select("slug, created_at, updated_at"),
    supabase.from("brands").select("slug, created_at"),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/pouches`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/brands`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/top-rated`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/highest-burn`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  const brandRoutes: MetadataRoute.Sitemap = (brands || []).map((brand) => ({
    url: `${siteUrl}/brands/${brand.slug}`,
    lastModified: brand.created_at ? new Date(brand.created_at) : now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const productRoutes: MetadataRoute.Sitemap = (products || []).map((product) => ({
    url: `${siteUrl}/pouches/${product.slug}`,
    lastModified: new Date(product.updated_at || product.created_at || now),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...brandRoutes, ...productRoutes];
}
