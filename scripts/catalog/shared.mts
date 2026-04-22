import fs from "node:fs/promises";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type FlavorCategory = "mint" | "fruit" | "coffee" | "tobacco" | "other";
export type StrengthLabel = "light" | "normal" | "strong" | "extra-strong" | "super-strong";
export type Format = "slim" | "mini" | "regular" | "large";
export type Moisture = "dry" | "normal" | "moist";

export const FLAVOR_CATEGORIES: FlavorCategory[] = ["mint", "fruit", "coffee", "tobacco", "other"];
export const STRENGTH_LABELS: StrengthLabel[] = ["light", "normal", "strong", "extra-strong", "super-strong"];

export type CatalogBrandInput = {
  name: string;
  slug?: string | null;
  country?: string | null;
  description?: string | null;
  websiteUrl?: string | null;
  logoUrl?: string | null;
};

export type CatalogProductInput = {
  brandSlug: string;
  name: string;
  slug?: string | null;
  flavor: string;
  flavorCategory: string;
  strengthMg: string | number;
  strengthLabel?: string | null;
  format?: string | null;
  pouchesPerCan?: string | number | null;
  moisture?: string | null;
  weightPerPouch?: string | number | null;
  description?: string | null;
  imageUrl?: string | null;
};

export type CatalogImportDocument = {
  brands: CatalogBrandInput[];
  products: CatalogProductInput[];
};

export type NormalizedBrandRecord = {
  name: string;
  slug: string;
  country: string | null;
  description: string | null;
  website_url: string | null;
  logo_url: string | null;
};

export type NormalizedProductRecord = {
  brand_slug: string;
  name: string;
  slug: string;
  flavor: string;
  flavor_category: FlavorCategory;
  strength_mg: number;
  strength_label: StrengthLabel | null;
  format: Format;
  pouches_per_can: number | null;
  moisture: Moisture | null;
  weight_per_pouch: number | null;
  description: string | null;
  image_url: string | null;
};

export type CatalogImportIssue = {
  level: "error" | "warning";
  scope: "brand" | "product" | "source";
  record: string;
  field: string;
  message: string;
};

export type CatalogImportResult = {
  brands: NormalizedBrandRecord[];
  products: NormalizedProductRecord[];
  issues: CatalogImportIssue[];
};

export type ExistingBrandRow = {
  id?: string;
  name: string;
  slug: string;
  country: string | null;
  description: string | null;
  website_url: string | null;
  logo_url: string | null;
};

export type ExistingProductRow = {
  id?: string;
  brand_id?: string;
  name: string;
  slug: string;
  flavor: string;
  flavor_category: string;
  strength_mg: number;
  strength_label: string | null;
  format: string;
  pouches_per_can: number | null;
  moisture: string | null;
  weight_per_pouch: number | null;
  description: string | null;
  image_url: string | null;
  brand_slug?: string | null;
};

export type CatalogPlanAction<TRecord> = {
  action: "create" | "update" | "noop";
  slug: string;
  next: TRecord;
  previous?: Record<string, unknown>;
  changedFields: string[];
};

export type CatalogImportPlan = {
  brands: CatalogPlanAction<NormalizedBrandRecord>[];
  products: CatalogPlanAction<NormalizedProductRecord>[];
  counts: {
    brandCreates: number;
    brandUpdates: number;
    brandNoops: number;
    productCreates: number;
    productUpdates: number;
    productNoops: number;
  };
};

export type CatalogSnapshot = {
  brands: NormalizedBrandRecord[];
  products: NormalizedProductRecord[];
};

const FLAVOR_CATEGORY_ALIASES: Record<string, FlavorCategory> = {
  mint: "mint",
  minty: "mint",
  menthol: "mint",
  peppermint: "mint",
  spearmint: "mint",
  fruit: "fruit",
  fruity: "fruit",
  berry: "fruit",
  citrus: "fruit",
  tropical: "fruit",
  coffee: "coffee",
  espresso: "coffee",
  mocha: "coffee",
  tobacco: "tobacco",
  classic: "tobacco",
  original: "tobacco",
  other: "other",
};

const FORMAT_ALIASES: Record<string, Format> = {
  slim: "slim",
  mini: "mini",
  regular: "regular",
  standard: "regular",
  normal: "regular",
  large: "large",
  maxi: "large",
};

const MOISTURE_ALIASES: Record<string, Moisture> = {
  dry: "dry",
  normal: "normal",
  standard: "normal",
  moist: "moist",
  wet: "moist",
};

function requireEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY") {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function createCatalogClient({ write = false }: { write?: boolean } = {}) {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (write) {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
      throw new Error(
        "SUPABASE_SERVICE_ROLE_KEY is required for write mode. Use dry-run without it."
      );
    }

    return createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
    });
  }

  return createClient(url, anonKey, {
    auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
  });
}

export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function trimOrNull(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function normalizeDisplayText(value: unknown, field: string) {
  const trimmed = trimOrNull(value);
  if (!trimmed) {
    throw new Error(`${field} is required`);
  }
  return trimmed.replace(/\s+/g, " ");
}

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

function normalizeOptionalUrl(
  rawValue: unknown,
  field: string,
  issues: CatalogImportIssue[],
  scope: "brand" | "product",
  record: string
) {
  const value = trimOrNull(rawValue);
  if (!value) return null;

  const normalized = normalizePublicWebsiteUrl(value);
  if (!normalized) {
    issues.push({
      level: "error",
      scope,
      record,
      field,
      message: `Invalid URL: ${value}`,
    });
    return null;
  }

  return normalized;
}

function normalizeAssetUrl(
  rawValue: unknown,
  field: string,
  issues: CatalogImportIssue[],
  scope: "brand" | "product",
  record: string
) {
  const value = trimOrNull(rawValue);
  if (!value) return null;

  try {
    const normalized = value.startsWith("http://") || value.startsWith("https://") ? value : `https://${value}`;
    const url = new URL(normalized);
    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error("unsupported protocol");
    }
    return url.toString();
  } catch {
    issues.push({
      level: "error",
      scope,
      record,
      field,
      message: `Invalid asset URL: ${value}`,
    });
    return null;
  }
}

function normalizeInteger(
  rawValue: unknown,
  field: string,
  { minimum = 0, required = false }: { minimum?: number; required?: boolean } = {}
) {
  if (rawValue == null || rawValue === "") {
    if (required) throw new Error(`${field} is required`);
    return null;
  }

  const parsed =
    typeof rawValue === "number"
      ? rawValue
      : Number.parseInt(String(rawValue).trim().replace(/[^\d-]+/g, ""), 10);

  if (!Number.isInteger(parsed) || parsed < minimum) {
    throw new Error(`${field} must be an integer >= ${minimum}`);
  }

  return parsed;
}

function normalizeDecimal(
  rawValue: unknown,
  field: string,
  { minimum = 0, required = false }: { minimum?: number; required?: boolean } = {}
) {
  if (rawValue == null || rawValue === "") {
    if (required) throw new Error(`${field} is required`);
    return null;
  }

  const parsed =
    typeof rawValue === "number"
      ? rawValue
      : Number.parseFloat(String(rawValue).trim().toLowerCase().replace(/mg|g/g, "").trim());

  if (!Number.isFinite(parsed) || parsed < minimum) {
    throw new Error(`${field} must be a number >= ${minimum}`);
  }

  return Number(parsed.toFixed(2));
}

function normalizeStrengthLabel(rawValue: unknown, strengthMg: number) {
  const value = trimOrNull(rawValue);
  if (!value) return inferStrengthLabel(strengthMg);

  const normalized = slugify(value);
  const match = STRENGTH_LABELS.find((label) => label === normalized);
  if (!match) {
    throw new Error(`strengthLabel must be one of: ${STRENGTH_LABELS.join(", ")}`);
  }

  return match;
}

function inferStrengthLabel(strengthMg: number): StrengthLabel {
  if (strengthMg <= 4) return "light";
  if (strengthMg <= 8) return "normal";
  if (strengthMg <= 12) return "strong";
  if (strengthMg <= 20) return "extra-strong";
  return "super-strong";
}

function normalizeFlavorCategory(rawValue: unknown) {
  const value = trimOrNull(rawValue);
  if (!value) {
    throw new Error(`flavorCategory is required and must be one of: ${FLAVOR_CATEGORIES.join(", ")}`);
  }

  const normalized = FLAVOR_CATEGORY_ALIASES[slugify(value)];
  if (!normalized) {
    throw new Error(`Unsupported flavorCategory "${value}"`);
  }

  return normalized;
}

function normalizeFormat(rawValue: unknown) {
  const value = trimOrNull(rawValue) || "slim";
  const normalized = FORMAT_ALIASES[slugify(value)];
  if (!normalized) {
    throw new Error(`Unsupported format "${value}"`);
  }
  return normalized;
}

function normalizeMoisture(rawValue: unknown) {
  const value = trimOrNull(rawValue);
  if (!value) return null;

  const normalized = MOISTURE_ALIASES[slugify(value)];
  if (!normalized) {
    throw new Error(`Unsupported moisture "${value}"`);
  }
  return normalized;
}

function buildProductSlug(
  brandSlug: string,
  name: string,
  strengthMg: number,
  providedSlug?: string | null
) {
  if (providedSlug) return slugify(providedSlug);

  const base = slugify(`${brandSlug}-${name}`);
  const mgToken = `${String(strengthMg).replace(/\.0$/, "")}mg`;
  return base.includes(mgToken) ? base : `${base}-${mgToken}`;
}

export function normalizeCatalogDocument(document: CatalogImportDocument): CatalogImportResult {
  const issues: CatalogImportIssue[] = [];
  const brands: NormalizedBrandRecord[] = [];
  const products: NormalizedProductRecord[] = [];
  const seenBrandSlugs = new Set<string>();
  const seenProductSlugs = new Set<string>();
  const knownBrandSlugs = new Set<string>();

  for (const input of document.brands || []) {
    const recordName = trimOrNull(input.name) || "(missing brand name)";

    try {
      const name = normalizeDisplayText(input.name, "name");
      const slug = slugify(trimOrNull(input.slug) || name);

      if (!slug) throw new Error("slug resolves to an empty value");
      if (seenBrandSlugs.has(slug)) {
        throw new Error(`Duplicate brand slug "${slug}" inside the import source`);
      }

      const brand: NormalizedBrandRecord = {
        name,
        slug,
        country: trimOrNull(input.country),
        description: trimOrNull(input.description),
        website_url: normalizeOptionalUrl(input.websiteUrl, "websiteUrl", issues, "brand", name),
        logo_url: normalizeAssetUrl(input.logoUrl, "logoUrl", issues, "brand", name),
      };

      seenBrandSlugs.add(slug);
      knownBrandSlugs.add(slug);
      brands.push(brand);
    } catch (error) {
      issues.push({
        level: "error",
        scope: "brand",
        record: recordName,
        field: "record",
        message: error instanceof Error ? error.message : "Unknown brand normalization error",
      });
    }
  }

  for (const input of document.products || []) {
    const recordName = trimOrNull(input.name) || "(missing product name)";

    try {
      const brandSlug = slugify(normalizeDisplayText(input.brandSlug, "brandSlug"));
      const name = normalizeDisplayText(input.name, "name");
      const flavor = normalizeDisplayText(input.flavor, "flavor");
      const strengthMg = normalizeDecimal(input.strengthMg, "strengthMg", {
        minimum: 0.1,
        required: true,
      });

      if (strengthMg == null) throw new Error("strengthMg is required");

      if (!knownBrandSlugs.has(brandSlug)) {
        issues.push({
          level: "warning",
          scope: "product",
          record: name,
          field: "brandSlug",
          message: `Brand slug "${brandSlug}" is not part of this import file; existing DB brand is expected`,
        });
      }

      const slug = buildProductSlug(brandSlug, name, strengthMg, trimOrNull(input.slug));
      if (!slug) throw new Error("slug resolves to an empty value");
      if (seenProductSlugs.has(slug)) {
        throw new Error(`Duplicate product slug "${slug}" inside the import source`);
      }

      const product: NormalizedProductRecord = {
        brand_slug: brandSlug,
        name,
        slug,
        flavor,
        flavor_category: normalizeFlavorCategory(input.flavorCategory),
        strength_mg: strengthMg,
        strength_label: normalizeStrengthLabel(input.strengthLabel, strengthMg),
        format: normalizeFormat(input.format),
        pouches_per_can: normalizeInteger(input.pouchesPerCan, "pouchesPerCan", {
          minimum: 1,
        }),
        moisture: normalizeMoisture(input.moisture),
        weight_per_pouch: normalizeDecimal(input.weightPerPouch, "weightPerPouch", {
          minimum: 0.01,
        }),
        description: trimOrNull(input.description),
        image_url: normalizeAssetUrl(input.imageUrl, "imageUrl", issues, "product", name),
      };

      seenProductSlugs.add(slug);
      products.push(product);
    } catch (error) {
      issues.push({
        level: "error",
        scope: "product",
        record: recordName,
        field: "record",
        message: error instanceof Error ? error.message : "Unknown product normalization error",
      });
    }
  }

  return { brands, products, issues };
}

function parseCsvLine(line: string) {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current);
  return result.map((value) => value.trim());
}

function parseCsvTable(content: string) {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.trim().length > 0);

  if (lines.length === 0) return [];

  const [header, ...rows] = lines;
  const columns = parseCsvLine(header);

  return rows.map((row) => {
    const values = parseCsvLine(row);
    return Object.fromEntries(columns.map((column, index) => [column, values[index] ?? ""]));
  });
}

export async function loadCatalogSource(sourcePath: string): Promise<CatalogImportDocument> {
  const resolvedPath = path.resolve(sourcePath);
  const stat = await fs.stat(resolvedPath);

  if (stat.isDirectory()) {
    const [brandsCsv, productsCsv] = await Promise.all([
      fs.readFile(path.join(resolvedPath, "brands.csv"), "utf8"),
      fs.readFile(path.join(resolvedPath, "products.csv"), "utf8"),
    ]);

    return {
      brands: parseCsvTable(brandsCsv) as CatalogBrandInput[],
      products: parseCsvTable(productsCsv) as CatalogProductInput[],
    };
  }

  if (resolvedPath.endsWith(".json")) {
    const raw = await fs.readFile(resolvedPath, "utf8");
    return JSON.parse(raw) as CatalogImportDocument;
  }

  if (resolvedPath.endsWith(".csv")) {
    throw new Error(
      "Single CSV file imports are not supported. Use a directory with brands.csv and products.csv, or a JSON file."
    );
  }

  throw new Error("Unsupported source type. Use a JSON file or a directory containing brands.csv and products.csv.");
}

function pickBrandComparable(record: ExistingBrandRow | NormalizedBrandRecord) {
  return {
    name: record.name,
    slug: record.slug,
    country: record.country ?? null,
    description: record.description ?? null,
    website_url: record.website_url ?? null,
    logo_url: record.logo_url ?? null,
  };
}

function pickProductComparable(record: ExistingProductRow | NormalizedProductRecord) {
  return {
    brand_slug: "brand_slug" in record ? record.brand_slug ?? null : record.brand_slug,
    name: record.name,
    slug: record.slug,
    flavor: record.flavor,
    flavor_category: record.flavor_category,
    strength_mg: Number(record.strength_mg),
    strength_label: record.strength_label ?? null,
    format: record.format,
    pouches_per_can: record.pouches_per_can ?? null,
    moisture: record.moisture ?? null,
    weight_per_pouch: record.weight_per_pouch ?? null,
    description: record.description ?? null,
    image_url: record.image_url ?? null,
  };
}

function diffFields<TRecord extends Record<string, unknown>>(
  previous: TRecord,
  next: TRecord
) {
  return Object.keys(next).filter((key) => {
    const left = previous[key];
    const right = next[key];
    return JSON.stringify(left ?? null) !== JSON.stringify(right ?? null);
  });
}

export function buildCatalogPlan(
  normalized: CatalogImportResult,
  existing: { brands: ExistingBrandRow[]; products: ExistingProductRow[] }
): CatalogImportPlan {
  const existingBrandsBySlug = new Map(existing.brands.map((brand) => [brand.slug, brand]));
  const existingProductsBySlug = new Map(existing.products.map((product) => [product.slug, product]));

  const brandActions = normalized.brands.map((brand) => {
    const previous = existingBrandsBySlug.get(brand.slug);
    if (!previous) {
      return { action: "create", slug: brand.slug, next: brand, changedFields: Object.keys(brand) } satisfies CatalogPlanAction<NormalizedBrandRecord>;
    }

    const changedFields = diffFields(pickBrandComparable(previous), pickBrandComparable(brand));
    return {
      action: changedFields.length > 0 ? "update" : "noop",
      slug: brand.slug,
      next: brand,
      previous: pickBrandComparable(previous),
      changedFields,
    } satisfies CatalogPlanAction<NormalizedBrandRecord>;
  });

  const productActions = normalized.products.map((product) => {
    const previous = existingProductsBySlug.get(product.slug);
    if (!previous) {
      return { action: "create", slug: product.slug, next: product, changedFields: Object.keys(product) } satisfies CatalogPlanAction<NormalizedProductRecord>;
    }

    const changedFields = diffFields(
      pickProductComparable(previous),
      pickProductComparable(product)
    );

    return {
      action: changedFields.length > 0 ? "update" : "noop",
      slug: product.slug,
      next: product,
      previous: pickProductComparable(previous),
      changedFields,
    } satisfies CatalogPlanAction<NormalizedProductRecord>;
  });

  return {
    brands: brandActions,
    products: productActions,
    counts: {
      brandCreates: brandActions.filter((action) => action.action === "create").length,
      brandUpdates: brandActions.filter((action) => action.action === "update").length,
      brandNoops: brandActions.filter((action) => action.action === "noop").length,
      productCreates: productActions.filter((action) => action.action === "create").length,
      productUpdates: productActions.filter((action) => action.action === "update").length,
      productNoops: productActions.filter((action) => action.action === "noop").length,
    },
  };
}

export async function fetchExistingCatalog(client: SupabaseClient) {
  const [{ data: brands, error: brandError }, { data: products, error: productError }] =
    await Promise.all([
      client.from("brands").select("id, name, slug, country, description, website_url, logo_url").order("slug"),
      client
        .from("products")
        .select(
          "id, brand_id, name, slug, flavor, flavor_category, strength_mg, strength_label, format, pouches_per_can, moisture, weight_per_pouch, description, image_url, brands(slug)"
        )
        .order("slug"),
    ]);

  if (brandError) throw brandError;
  if (productError) throw productError;

  const normalizedProducts = (products || []).map((product) => {
    const relation = Array.isArray(product.brands) ? product.brands[0] : product.brands;
    return {
      ...product,
      brand_slug: relation?.slug ?? null,
    } as ExistingProductRow;
  });

  return {
    brands: (brands || []) as ExistingBrandRow[],
    products: normalizedProducts,
  };
}

export async function applyCatalogPlan(client: SupabaseClient, plan: CatalogImportPlan) {
  const brandWrites = plan.brands
    .filter((action) => action.action !== "noop")
    .map((action) => action.next);

  if (brandWrites.length > 0) {
    const { error } = await client.from("brands").upsert(brandWrites, { onConflict: "slug" });
    if (error) throw error;
  }

  const { data: brandRows, error: brandReadError } = await client
    .from("brands")
    .select("id, slug");

  if (brandReadError) throw brandReadError;

  const brandIdBySlug = new Map((brandRows || []).map((brand) => [brand.slug, brand.id]));
  const productWrites = plan.products
    .filter((action) => action.action !== "noop")
    .map((action) => {
      const brandId = brandIdBySlug.get(action.next.brand_slug);
      if (!brandId) {
        throw new Error(`Cannot write product "${action.next.slug}" because brand "${action.next.brand_slug}" was not found`);
      }

      return {
        brand_id: brandId,
        name: action.next.name,
        slug: action.next.slug,
        flavor: action.next.flavor,
        flavor_category: action.next.flavor_category,
        strength_mg: action.next.strength_mg,
        strength_label: action.next.strength_label,
        format: action.next.format,
        pouches_per_can: action.next.pouches_per_can,
        moisture: action.next.moisture,
        weight_per_pouch: action.next.weight_per_pouch,
        description: action.next.description,
        image_url: action.next.image_url,
      };
    });

  if (productWrites.length > 0) {
    const { error } = await client.from("products").upsert(productWrites, { onConflict: "slug" });
    if (error) throw error;
  }
}

export function printIssues(issues: CatalogImportIssue[]) {
  if (issues.length === 0) {
    console.log("No validation issues found.");
    return;
  }

  for (const issue of issues) {
    console.log(
      `[${issue.level.toUpperCase()}] ${issue.scope}:${issue.record} ${issue.field} — ${issue.message}`
    );
  }
}

export function printPlan(plan: CatalogImportPlan) {
  console.log("Import plan");
  console.log(
    `Brands: ${plan.counts.brandCreates} create, ${plan.counts.brandUpdates} update, ${plan.counts.brandNoops} noop`
  );
  console.log(
    `Products: ${plan.counts.productCreates} create, ${plan.counts.productUpdates} update, ${plan.counts.productNoops} noop`
  );

  const changedActions = [...plan.brands, ...plan.products].filter(
    (action) => action.action !== "noop"
  );

  for (const action of changedActions.slice(0, 20)) {
    console.log(
      `- ${action.action.toUpperCase()} ${action.slug}${action.changedFields.length > 0 ? ` (${action.changedFields.join(", ")})` : ""}`
    );
  }

  if (changedActions.length > 20) {
    console.log(`... ${changedActions.length - 20} more change(s) not shown`);
  }
}

export function applyPlanToSnapshot(
  snapshot: CatalogSnapshot,
  plan: CatalogImportPlan
): CatalogSnapshot {
  const brandsBySlug = new Map(snapshot.brands.map((brand) => [brand.slug, brand]));
  for (const action of plan.brands) {
    brandsBySlug.set(action.slug, action.next);
  }

  const productsBySlug = new Map(snapshot.products.map((product) => [product.slug, product]));
  for (const action of plan.products) {
    productsBySlug.set(action.slug, action.next);
  }

  return {
    brands: [...brandsBySlug.values()].sort((left, right) => left.slug.localeCompare(right.slug)),
    products: [...productsBySlug.values()].sort((left, right) => left.slug.localeCompare(right.slug)),
  };
}
