import {
  createCatalogClient,
  fetchExistingCatalog,
  FLAVOR_CATEGORIES,
  printIssues,
  slugify,
  STRENGTH_LABELS,
} from "./shared.mts";

const FORMATS = ["slim", "mini", "regular", "large"] as const;

function normalizePublicWebsiteUrl(value: string) {
  const candidate =
    value.startsWith("http://") || value.startsWith("https://") ? value : `https://${value}`;

  try {
    const url = new URL(candidate);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    if (!url.hostname || !url.hostname.includes(".")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

type IntegrityIssue = {
  level: "warning" | "error";
  area: "brand" | "product" | "catalog";
  slug: string;
  message: string;
};

function pushIssue(
  issues: IntegrityIssue[],
  level: IntegrityIssue["level"],
  area: IntegrityIssue["area"],
  slug: string,
  message: string
) {
  issues.push({ level, area, slug, message });
}

function findDuplicates(values: string[]) {
  const counts = new Map<string, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) || 0) + 1);
  }
  return [...counts.entries()].filter(([, count]) => count > 1).map(([value]) => value);
}

const client = createCatalogClient();
const { brands, products } = await fetchExistingCatalog(client);
const issues: IntegrityIssue[] = [];
const brandById = new Map(brands.map((brand) => [brand.id, brand]));

for (const brand of brands) {
  if (!brand.logo_url) {
    pushIssue(issues, "warning", "brand", brand.slug, "Missing brand logo");
  }

  if (!brand.website_url) {
    pushIssue(issues, "warning", "brand", brand.slug, "Missing official website");
  } else if (!normalizePublicWebsiteUrl(brand.website_url)) {
    pushIssue(issues, "error", "brand", brand.slug, `Invalid website URL: ${brand.website_url}`);
  }

  if (brand.slug !== slugify(brand.slug)) {
    pushIssue(issues, "warning", "brand", brand.slug, "Slug is not canonical lowercase kebab-case");
  }
}

for (const duplicateSlug of findDuplicates(brands.map((brand) => slugify(brand.slug)))) {
  pushIssue(issues, "error", "catalog", duplicateSlug, "Duplicate canonical brand slug");
}

for (const product of products) {
  const brand = product.brand_id ? brandById.get(product.brand_id) : null;

  if (!brand) {
    pushIssue(issues, "error", "product", product.slug, "Broken brand reference");
  }

  if (!product.description) {
    pushIssue(issues, "warning", "product", product.slug, "Missing product description");
  }

  if (!product.flavor_category) {
    pushIssue(issues, "error", "product", product.slug, "Missing flavor family");
  } else if (!FLAVOR_CATEGORIES.includes(product.flavor_category as (typeof FLAVOR_CATEGORIES)[number])) {
    pushIssue(issues, "error", "product", product.slug, `Unsupported flavor family: ${product.flavor_category}`);
  }

  if (product.strength_mg == null || Number(product.strength_mg) <= 0) {
    pushIssue(issues, "error", "product", product.slug, "Missing or invalid nicotine strength");
  }

  if (product.strength_label && !STRENGTH_LABELS.includes(product.strength_label as (typeof STRENGTH_LABELS)[number])) {
    pushIssue(issues, "warning", "product", product.slug, `Unsupported strength label: ${product.strength_label}`);
  }

  if (!FORMATS.includes(product.format as (typeof FORMATS)[number])) {
    pushIssue(issues, "warning", "product", product.slug, `Unsupported format value: ${product.format}`);
  }

  if (product.slug !== slugify(product.slug)) {
    pushIssue(issues, "warning", "product", product.slug, "Slug is not canonical lowercase kebab-case");
  }
}

for (const duplicateSlug of findDuplicates(products.map((product) => slugify(product.slug)))) {
  pushIssue(issues, "error", "catalog", duplicateSlug, "Duplicate canonical product slug");
}

for (const duplicateKey of findDuplicates(
  products.map((product) => `${product.brand_slug || "missing-brand"}::${slugify(product.name)}::${product.strength_mg}`)
)) {
  pushIssue(issues, "warning", "catalog", duplicateKey, "Duplicate brand/name/strength combination");
}

const summary = {
  brands: brands.length,
  products: products.length,
  errors: issues.filter((issue) => issue.level === "error").length,
  warnings: issues.filter((issue) => issue.level === "warning").length,
};

console.log("Catalog integrity report");
console.log(JSON.stringify(summary, null, 2));

printIssues(
  issues.map((issue) => ({
    level: issue.level,
    scope: issue.area === "catalog" ? "source" : issue.area,
    record: issue.slug,
    field: "integrity",
    message: issue.message,
  }))
);

if (issues.some((issue) => issue.level === "error")) {
  process.exitCode = 1;
}
