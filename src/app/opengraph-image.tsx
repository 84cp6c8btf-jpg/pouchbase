import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "PouchBase — The Independent Nicotine Pouch Encyclopedia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#0a0b10",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Logo area */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "72px",
              height: "72px",
              borderRadius: "22px",
              backgroundColor: "rgba(249, 115, 22, 0.15)",
              border: "2px solid rgba(249, 115, 22, 0.3)",
              fontSize: "36px",
            }}
          >
            🔥
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ color: "white", fontSize: "56px", fontWeight: 800, lineHeight: 1 }}>
              Pouch<span style={{ color: "#f97316" }}>Base</span>
            </span>
            <span
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: "16px",
                letterSpacing: "0.3em",
                marginTop: "4px",
              }}
            >
              REVIEW INDEX
            </span>
          </div>
        </div>

        {/* Tagline */}
        <span
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: "28px",
            maxWidth: "700px",
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          The independent encyclopedia for nicotine pouches. Real reviews. Real burn ratings. Best prices.
        </span>

        {/* Stats bar */}
        <div
          style={{
            display: "flex",
            gap: "48px",
            marginTop: "48px",
            padding: "24px 48px",
            borderRadius: "20px",
            backgroundColor: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ color: "#f97316", fontSize: "36px", fontWeight: 800 }}>59+</span>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", letterSpacing: "0.15em" }}>
              POUCHES
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ color: "#f97316", fontSize: "36px", fontWeight: 800 }}>19</span>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", letterSpacing: "0.15em" }}>
              BRANDS
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ color: "#f97316", fontSize: "36px", fontWeight: 800 }}>1-50mg</span>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", letterSpacing: "0.15em" }}>
              STRENGTH RANGE
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
