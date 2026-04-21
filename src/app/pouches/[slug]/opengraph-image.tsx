import { ImageResponse } from "next/og";
import { supabase } from "@/lib/supabase";

export const runtime = "edge";
export const alt = "PouchBase — Nicotine Pouch Review";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function getBurnColor(burn: number): string {
  if (burn <= 3) return "#22c55e";
  if (burn <= 5) return "#eab308";
  if (burn <= 7) return "#f97316";
  return "#ef4444";
}

function getBurnLabel(burn: number): string {
  if (burn <= 2) return "MILD";
  if (burn <= 4) return "MODERATE";
  if (burn <= 6) return "SPICY";
  if (burn <= 8) return "INTENSE";
  return "INFERNO";
}

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const { data: product } = await supabase
    .from("products")
    .select("name, flavor, strength_mg, strength_label, avg_burn, avg_overall, review_count, brands(name)")
    .eq("slug", slug)
    .single();

  if (!product) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            backgroundColor: "#0a0b10",
            color: "white",
            fontSize: 48,
            fontWeight: 700,
          }}
        >
          PouchBase
        </div>
      ),
      { ...size }
    );
  }

  const brandRaw = product.brands;
  const brandName = Array.isArray(brandRaw) ? brandRaw[0]?.name : (brandRaw as { name: string } | null)?.name || "";
  const burnColor = getBurnColor(product.avg_burn);
  const burnLabel = getBurnLabel(product.avg_burn);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: "#0a0b10",
          padding: "60px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "44px",
              height: "44px",
              borderRadius: "14px",
              backgroundColor: "rgba(249, 115, 22, 0.15)",
              border: "1px solid rgba(249, 115, 22, 0.3)",
              fontSize: "22px",
            }}
          >
            🔥
          </div>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "18px", letterSpacing: "0.15em" }}>
            POUCHBASE REVIEW INDEX
          </span>
        </div>

        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "32px" }}>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "22px", letterSpacing: "0.1em" }}>
            {brandName.toUpperCase()}
          </span>
          <span
            style={{
              color: "white",
              fontSize: "72px",
              fontWeight: 800,
              lineHeight: 1,
              maxWidth: "900px",
            }}
          >
            {product.name}
          </span>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: "32px", alignItems: "flex-end" }}>
          {/* Burn */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              padding: "20px 28px",
              borderRadius: "20px",
              backgroundColor: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", letterSpacing: "0.2em" }}>
              BURN INDEX
            </span>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
              <span style={{ color: burnColor, fontSize: "56px", fontWeight: 800, lineHeight: 1 }}>
                {product.avg_burn.toFixed(1)}
              </span>
              <span style={{ color: burnColor, fontSize: "18px", fontWeight: 600, opacity: 0.8 }}>
                {burnLabel}
              </span>
            </div>
          </div>

          {/* Overall */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              padding: "20px 28px",
              borderRadius: "20px",
              backgroundColor: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", letterSpacing: "0.2em" }}>
              OVERALL
            </span>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
              <span style={{ color: "#f97316", fontSize: "56px", fontWeight: 800, lineHeight: 1 }}>
                {product.avg_overall.toFixed(1)}
              </span>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "18px" }}>/10</span>
            </div>
          </div>

          {/* Tags */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginLeft: "auto" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                borderRadius: "12px",
                backgroundColor: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "18px" }}>
                ⚡ {product.strength_mg}mg · {product.strength_label}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                borderRadius: "12px",
                backgroundColor: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "18px" }}>
                {product.flavor} · {product.review_count} reviews
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
