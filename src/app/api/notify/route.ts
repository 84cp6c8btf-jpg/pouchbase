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

    // Supabase sends: { type, table, record, schema, old_record }
    const table = payload.table;
    const type = payload.type;
    const record = payload.record;

    let title = "PouchCompare";
    let message = "Something happened on the site";
    let tags = "bell";
    let clickUrl = "https://pouchcompare.com";

    if (type === "INSERT" && table === "reviews" && record) {
      title = "New Review";
      tags = "fire";
      const burn = record.burn_rating ?? "?";
      const flavor = record.flavor_rating ?? "?";
      const overall = record.overall_rating ?? "?";
      const text = record.review_text
        ? `"${record.review_text.slice(0, 80)}${record.review_text.length > 80 ? "..." : ""}"`
        : "No text";
      message = `Burn: ${burn}/10 · Flavor: ${flavor}/10 · Overall: ${overall}/10\n${text}`;
      clickUrl = `https://pouchcompare.com/pouches`;
    } else if (type === "INSERT" && table === "profiles" && record) {
      title = "New Signup";
      tags = "tada";
      const name = record.display_name || record.username || record.email || "Someone";
      message = `${name} just joined PouchCompare!`;
    } else if (type === "DELETE" && table === "reviews") {
      title = "Review Deleted";
      tags = "wastebasket";
      message = "A review was removed.";
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
