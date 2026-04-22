import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  getPollChoiceCookieName,
  getPollResults,
  getPollVoterCookieName,
} from "@/lib/polls";
import { createSupabaseServerClient } from "@/lib/supabase";

type Params = {
  params: Promise<{ pollId: string }>;
};

async function getResultsForPoll(pollId: string) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("poll_options")
    .select("id, vote_count")
    .eq("poll_id", pollId)
    .order("sort_order", { ascending: true });

  return getPollResults(
    (data || []).map((row) => ({
      id: row.id,
      voteCount: row.vote_count,
    }))
  );
}

export async function GET(_request: Request, { params }: Params) {
  const { pollId } = await params;
  const cookieStore = await cookies();
  const selectedOptionId = cookieStore.get(getPollChoiceCookieName(pollId))?.value ?? null;

  return NextResponse.json({ selectedOptionId });
}

export async function POST(request: Request, { params }: Params) {
  const { pollId } = await params;
  const cookieStore = await cookies();
  const payload = (await request.json().catch(() => null)) as { optionId?: string } | null;
  const optionId = payload?.optionId;

  if (!optionId) {
    return NextResponse.json({ error: "Missing poll option." }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const { data: activePoll } = await supabase
    .from("polls")
    .select("id")
    .eq("id", pollId)
    .eq("status", "active")
    .maybeSingle<{ id: string }>();

  if (!activePoll) {
    return NextResponse.json({ error: "This poll is no longer active." }, { status: 404 });
  }

  const { data: option } = await supabase
    .from("poll_options")
    .select("id")
    .eq("id", optionId)
    .eq("poll_id", pollId)
    .maybeSingle<{ id: string }>();

  if (!option) {
    return NextResponse.json({ error: "That option is not available for this poll." }, { status: 400 });
  }

  const voterCookieName = getPollVoterCookieName();
  const choiceCookieName = getPollChoiceCookieName(pollId);
  const existingChoice = cookieStore.get(choiceCookieName)?.value ?? null;
  const voterKey = cookieStore.get(voterCookieName)?.value ?? crypto.randomUUID();

  const { error } = await supabase.from("poll_votes").insert({
    poll_id: pollId,
    poll_option_id: optionId,
    voter_key: voterKey,
  });

  const results = await getResultsForPoll(pollId);

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        {
          error: "You already voted in this week's battle.",
          selectedOptionId: existingChoice,
          results,
        },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: error.message, results }, { status: 400 });
  }

  const response = NextResponse.json({
    selectedOptionId: optionId,
    results,
  });

  response.cookies.set({
    name: voterCookieName,
    value: voterKey,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  response.cookies.set({
    name: choiceCookieName,
    value: optionId,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });

  return response;
}
