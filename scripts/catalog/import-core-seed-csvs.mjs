import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const sourceDir = process.argv[2];
const shouldWrite = process.argv.includes("--write");

if (!sourceDir) {
  console.error("Usage: node --env-file=.env.local scripts/catalog/import-core-seed-csvs.mjs <csv-directory> [--write]");
  process.exit(1);
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result.map((value) => value.trim());
}

function parseCsv(content) {
  const rows = content
    .replace(/^\uFEFF/, "")
    .trim()
    .split(/\r?\n/)
    .filter(Boolean);
  const columns = parseCsvLine(rows[0]);

  return rows.slice(1).map((row) => {
    const values = parseCsvLine(row);
    return Object.fromEntries(columns.map((column, index) => [column, values[index] ?? ""]));
  });
}

function parseBoolean(value) {
  return String(value).trim().toLowerCase() === "true";
}

function parsePositiveNumber(value) {
  const parsed = Number.parseFloat(String(value).trim());
  return Number.isFinite(parsed) && parsed > 0 ? Number(parsed.toFixed(2)) : null;
}

function parsePositiveInteger(value) {
  const parsed = Number.parseInt(String(value).trim(), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function isSlug(value) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function chunk(values, size = 500) {
  const chunks = [];
  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }
  return chunks;
}

const requiredColumns = [
  "brand",
  "brand_slug",
  "product_name",
  "slug",
  "line",
  "flavor",
  "flavor_family",
  "nicotine_mg_per_pouch",
  "format",
  "pouch_count",
  "moisture_level",
  "is_active",
  "source_url",
];

const files = fs
  .readdirSync(sourceDir)
  .filter((file) => file.endsWith(".csv"))
  .sort();

const rawRows = [];
for (const file of files) {
  const filePath = path.join(sourceDir, file);
  const rows = parseCsv(fs.readFileSync(filePath, "utf8"));
  for (const row of rows) rawRows.push({ ...row, file });
}

const issues = [];
const brandBySlug = new Map();
const productBySlug = new Map();
const skippedRows = [];

for (const row of rawRows) {
  const rowLabel = `${row.file}#${row.rank_proxy || "?"}:${row.slug || row.product_name || "(missing product)"}`;
  const missing = requiredColumns.filter((column) => !String(row[column] ?? "").trim());
  const nicotineMg = parsePositiveNumber(row.nicotine_mg_per_pouch);
  const pouchCount = parsePositiveInteger(row.pouch_count);

  if (missing.length > 0 || nicotineMg === null || pouchCount === null) {
    skippedRows.push({
      row: rowLabel,
      reason:
        missing.length > 0
          ? `Missing required field(s): ${missing.join(", ")}`
          : "Invalid positive numeric field",
    });
    continue;
  }

  if (!isSlug(row.brand_slug)) {
    issues.push(`${rowLabel}: invalid brand_slug "${row.brand_slug}"`);
    continue;
  }

  if (!isSlug(row.slug)) {
    issues.push(`${rowLabel}: invalid slug "${row.slug}"`);
    continue;
  }

  if (productBySlug.has(row.slug)) {
    issues.push(`${rowLabel}: duplicate product slug "${row.slug}"`);
    continue;
  }

  const brandIsActive = parseBoolean(row.is_active) || (brandBySlug.get(row.brand_slug)?.is_active ?? false);
  brandBySlug.set(row.brand_slug, {
    name: row.brand,
    slug: row.brand_slug,
    description: null,
    website_url: null,
    logo_url: null,
    country_origin: null,
    is_active: brandIsActive,
  });

  productBySlug.set(row.slug, {
    brand_slug: row.brand_slug,
    name: row.product_name,
    slug: row.slug,
    line: row.line,
    flavor: row.flavor,
    flavor_family: row.flavor_family,
    nicotine_mg: nicotineMg,
    format: row.format,
    pouch_count: pouchCount,
    moisture_level: row.moisture_level,
    description: null,
    image_url: null,
    gtin: null,
    source_url: row.source_url || null,
    is_active: parseBoolean(row.is_active),
  });
}

if (issues.length > 0) {
  console.error("Import aborted because validation errors were found:");
  for (const issue of issues.slice(0, 80)) console.error(`- ${issue}`);
  if (issues.length > 80) console.error(`... ${issues.length - 80} more`);
  process.exit(1);
}

const brands = [...brandBySlug.values()].sort((left, right) => left.slug.localeCompare(right.slug));
const products = [...productBySlug.values()].sort((left, right) => left.slug.localeCompare(right.slug));

console.log(`Source files: ${files.length}`);
console.log(`Source rows: ${rawRows.length}`);
console.log(`Valid brands: ${brands.length}`);
console.log(`Valid products: ${products.length}`);
console.log(`Skipped rows: ${skippedRows.length}`);
console.log(`Active products: ${products.filter((product) => product.is_active).length}`);
console.log(`Inactive products: ${products.filter((product) => !product.is_active).length}`);

if (skippedRows.length > 0) {
  console.log("Skipped row sample:");
  for (const skipped of skippedRows.slice(0, 20)) {
    console.log(`- ${skipped.row} — ${skipped.reason}`);
  }
}

if (!shouldWrite) {
  console.log("Dry run complete. Re-run with --write to apply changes.");
  process.exit(0);
}

const supabase = createClient(
  requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
  requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  { auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false } }
);

const { error: schemaCheckError } = await supabase
  .from("brands")
  .select("id", { count: "exact", head: true });

if (schemaCheckError) {
  throw new Error(
    `Core schema is not ready in Supabase: ${schemaCheckError.message}. Apply supabase/migrations/20260425173000_core_schema.sql in the Supabase SQL editor, then rerun this importer.`
  );
}

for (const brandChunk of chunk(brands)) {
  const { error } = await supabase.from("brands").upsert(brandChunk, { onConflict: "slug" });
  if (error) throw error;
}

const { data: brandRows, error: brandReadError } = await supabase
  .from("brands")
  .select("id, slug");
if (brandReadError) throw brandReadError;

const brandIdBySlug = new Map((brandRows || []).map((brand) => [brand.slug, brand.id]));
const productWrites = products.map(({ brand_slug, ...product }) => {
  const brandId = brandIdBySlug.get(brand_slug);
  if (!brandId) throw new Error(`Brand "${brand_slug}" not found for product "${product.slug}"`);
  return {
    ...product,
    brand_id: brandId,
  };
});

for (const productChunk of chunk(productWrites)) {
  const { error } = await supabase.from("products").upsert(productChunk, { onConflict: "slug" });
  if (error) throw error;
}

console.log("Import applied successfully.");
