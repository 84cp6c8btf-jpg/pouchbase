import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getPollChoiceCookieName } from "@/lib/polls";

type Params = {
  params: Promise<{ pollId: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  const { pollId } = await params;
  const cookieStore = await cookies();
  const selectedOptionId = cookieStore.get(getPollChoiceCookieName(pollId))?.value ?? null;

  return NextResponse.json({ selectedOptionId });
}

export async function POST(request: Request, { params }: Params) {
  await params;
  await request.json().catch(() => null);
  return NextResponse.json({ error: "Polls are not part of the core schema." }, { status: 410 });
}
