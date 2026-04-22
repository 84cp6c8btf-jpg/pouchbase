export const SITE_NAME = "PouchBase";
export const SITE_DESCRIPTION =
  "The independent encyclopedia for nicotine pouches. Compare real product data, retailer pricing where available, and community reviews where enough rating volume exists.";

function normalizeUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://") ? value : `https://${value}`;
}

export function getPublicWebsiteUrl(value?: string | null) {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const candidate = normalizeUrl(trimmed);
    const url = new URL(candidate);

    if (!["http:", "https:"].includes(url.protocol)) return null;
    if (!url.hostname || !url.hostname.includes(".")) return null;

    return url.toString();
  } catch {
    return null;
  }
}

export function getSiteUrl() {
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL;

  return normalizeUrl(envUrl || "http://localhost:3000");
}
