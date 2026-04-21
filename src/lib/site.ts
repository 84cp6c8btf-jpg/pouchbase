export const SITE_NAME = "PouchBase";
export const SITE_DESCRIPTION =
  "The independent encyclopedia for nicotine pouches. Compare prices, read real reviews, and find the perfect pouch with our burn rating system.";

function normalizeUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://") ? value : `https://${value}`;
}

export function getSiteUrl() {
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL;

  return normalizeUrl(envUrl || "http://localhost:3000");
}
