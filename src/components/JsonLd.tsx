/**
 * JSON-LD structured data components for SEO.
 * These help Google show rich results (star ratings, prices, breadcrumbs).
 */
import { hasPublicScore } from "@/lib/burn";

interface ProductJsonLdProps {
  name: string;
  brand: string;
  description: string;
  slug: string;
  flavor: string;
  strengthMg: number;
  avgOverall: number;
  reviewCount: number;
  siteUrl: string;
  lowestPrice?: number;
  highestPrice?: number;
  currency?: string;
}

export function ProductJsonLd({
  name,
  brand,
  description,
  slug,
  flavor,
  strengthMg,
  avgOverall,
  reviewCount,
  siteUrl,
  lowestPrice,
  highestPrice,
  currency = "EUR",
}: ProductJsonLdProps) {
  const fullName = `${brand} ${name}`;

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: fullName,
    description,
    brand: {
      "@type": "Brand",
      name: brand,
    },
    category: "Nicotine Pouches",
    url: `${siteUrl}/pouches/${slug}`,
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Flavor",
        value: flavor,
      },
      {
        "@type": "PropertyValue",
        name: "Nicotine Strength",
        value: `${strengthMg}mg`,
      },
    ],
  };

  if (hasPublicScore(reviewCount)) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: (avgOverall / 2).toFixed(1), // Convert 1-10 to 1-5 for schema
      bestRating: "5",
      worstRating: "1",
      ratingCount: reviewCount,
    };
  }

  if (lowestPrice && lowestPrice > 0) {
    data.offers = {
      "@type": "AggregateOffer",
      priceCurrency: currency,
      lowPrice: lowestPrice.toFixed(2),
      highPrice: (highestPrice || lowestPrice).toFixed(2),
      offerCount: highestPrice !== lowestPrice ? 2 : 1,
      availability: "https://schema.org/InStock",
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

interface BreadcrumbJsonLdProps {
  items: { name: string; href: string }[];
  siteUrl: string;
}

export function BreadcrumbJsonLd({ items, siteUrl }: BreadcrumbJsonLdProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.href}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd({ siteUrl }: { siteUrl: string }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "PouchBase",
    url: siteUrl,
    description:
      "The independent encyclopedia for nicotine pouches. Compare real product data, retailer pricing where available, and read real community reviews where enough rating volume exists.",
    foundingDate: "2026",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function WebSiteJsonLd({ siteUrl }: { siteUrl: string }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "PouchBase",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/pouches?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
