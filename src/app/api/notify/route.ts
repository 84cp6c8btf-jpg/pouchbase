import { NextRequest, NextResponse } from "next/server";

const NTFY_TOPIC = "pouchcompare-alerts";
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  // Verify the request is legit
  const secret = req.headers.get("x-webhook-secret");
  if (!WEBHOOK_SECRET || secret !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = await req.json();
    const { type, record } = payload;

    let title = "PouchCompare";
    let message = "Something happened on the site";

    if (type === "INSERT" && record) {
      // Detect if it's a review or a signup based on the fields
      if ("burn_rating" in record) {
        // It's a review
        title = "🔥 New Review";
        message = `Someone just reviewed a pouch! Burn: ${record.burn_rating}/10, Overall: ${record.overall_rating}/10`;
      } else if ("username" in record || "display_name" in record) {
        // It's a new signup (profiles table)
        title = "👤 New Signup";
        message = `New user just joined: ${record.display_name || record.username || "Anonymous"}`;
      }
    }

    await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
      method: "POST",
      headers: {
        Title: title,
        Tags: type === "INSERT" && "burn_rating" in (record || {}) ? "fire" : "wave",
      },
      body: message,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
