import { NextRequest, NextResponse } from "next/server";

const NTFY_TOPIC = "pouchcompare-alerts";
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const ICON_URL = "https://pouchcompare.com/favicon.ico";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-webhook-secret");
  if (!WEBHOOK_SECRET || secret !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = await req.json();

    // Debug: send raw payload to see what Supabase actually sends
    const table = payload.table ?? "unknown";
    const type = payload.type ?? "unknown";
    const record = payload.record;

    let title = "PouchCompare";
    let message = `Debug — type: ${type}, table: ${table}, keys: ${record ? Object.keys(record).join(", ") : "no record"}`;
    let tags = "bell";
    let clickUrl = "https://pouchcompare.com";

    // Match both INSERT and UPDATE
    const isReview = table === "reviews" && record;
    const isProfile = table === "profiles" && record;

    if (isReview) {
      title = type === "UPDATE" ? "Review Updated" : "New Review";
      tags = "fire";
      const burn = record.burn_rating ?? "?";
      const flavor = record.flavor_rating ?? "?";
      const overall = record.overall_rating ?? "?";
      const text = record.review_text
        ? `"${record.review_text.slice(0, 80)}${record.review_text.length > 80 ? "..." : ""}"`
        : "No text";
      message = `Burn: ${burn}/10 · Flavor: ${flavor}/10 · Overall: ${overall}/10\n${text}`;
      clickUrl = "https://pouchcompare.com/pouches";
    } else if (isProfile) {
      title = "New Signup";
      tags = "tada";
      const name = record.display_name || record.username || record.email || "Someone";
      message = `${name} just joined PouchCompare!`;
    }

    await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
      method: "POST",
      headers: {
        Title: title,
        Tags: tags,
        Icon: ICON_URL,
        Click: clickUrl,
      },
      body: message,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Notify error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
