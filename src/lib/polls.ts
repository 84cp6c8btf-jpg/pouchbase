import { getBrand, type ProductWithBrand } from "@/lib/catalog/discovery";
import { POLL_OPTION_WITH_PRODUCT_SELECT } from "@/lib/catalog/selects";
import { unwrapRelation, type PollCategory, type PollStatus } from "@/lib/types";
import { createSupabaseServerClient } from "@/lib/supabase";

type PollRow = {
  id: string;
  slug: string;
  question: string;
  status: PollStatus;
  category: PollCategory;
  week_label: string | null;
  starts_at: string | null;
  cta_label: string | null;
};

type PollOptionRow = {
  id: string;
  poll_id: string;
  label: string | null;
  sort_order: number;
  product_id: string | null;
  products: ProductWithBrand[] | ProductWithBrand | null;
};

export type PollOption = {
  id: string;
  pollId: string;
  label: string | null;
  sortOrder: number;
  productId: string | null;
  product: ProductWithBrand | null;
};

export type WeeklyPoll = {
  id: string;
  slug: string;
  question: string;
  status: PollStatus;
  category: PollCategory;
  weekLabel: string | null;
  startsAt: string | null;
  ctaLabel: string | null;
  options: [PollOption, PollOption];
};

export type PollResults = {
  totalVotes: number;
  options: Record<string, { percentage: number; voteCount: number }>;
};

export type PollResultRow = {
  id: string;
  voteCount: number;
};

function normalizeProduct(product: PollOptionRow["products"]) {
  return unwrapRelation(product);
}

function normalizeOption(option: PollOptionRow): PollOption {
  return {
    id: option.id,
    pollId: option.poll_id,
    label: option.label,
    sortOrder: option.sort_order,
    productId: option.product_id,
    product: normalizeProduct(option.products),
  };
}

export function getPollResults(options: PollResultRow[]): PollResults {
  const totalVotes = options.reduce((sum, option) => sum + option.voteCount, 0);

  return {
    totalVotes,
    options: Object.fromEntries(
      options.map((option) => [
        option.id,
        {
          percentage: totalVotes === 0 ? 0 : Math.round((option.voteCount / totalVotes) * 100),
          voteCount: option.voteCount,
        },
      ])
    ),
  };
}

export function getPollEyebrow(poll: WeeklyPoll) {
  const label = poll.category === "burn" ? "Weekly Burn Battle" : "Weekly Poll";
  return poll.weekLabel ? `${label} / ${poll.weekLabel}` : label;
}

export function getPollOptionTitle(option: PollOption) {
  return option.product?.name || option.label || "Option";
}

export function getPollOptionSubtitle(option: PollOption) {
  if (!option.product) return null;

  const brand = getBrand(option.product);
  return [brand?.name, option.product.flavor, `${option.product.strength_mg}mg`]
    .filter(Boolean)
    .join(" / ");
}

export function getPollCompareHref(poll: WeeklyPoll) {
  const [left, right] = poll.options;
  if (!left.product?.slug || !right.product?.slug) return null;
  return `/compare?left=${encodeURIComponent(left.product.slug)}&right=${encodeURIComponent(right.product.slug)}`;
}

export function getPollVoterCookieName() {
  return "pb_poll_voter";
}

export function getPollChoiceCookieName(pollId: string) {
  return `pb_poll_choice_${pollId}`;
}

export async function getActiveWeeklyPoll() {
  const supabase = createSupabaseServerClient();
  const { data: poll } = await supabase
    .from("polls")
    .select("id, slug, question, status, category, week_label, starts_at, cta_label")
    .eq("status", "active")
    .order("starts_at", { ascending: false })
    .limit(1)
    .maybeSingle<PollRow>();

  if (!poll) return null;

  const { data: optionRows } = await supabase
    .from("poll_options")
    .select(POLL_OPTION_WITH_PRODUCT_SELECT)
    .eq("poll_id", poll.id)
    .order("sort_order", { ascending: true });

  const options = ((optionRows || []) as PollOptionRow[]).map(normalizeOption);

  if (options.length !== 2) {
    return null;
  }

  return {
    id: poll.id,
    slug: poll.slug,
    question: poll.question,
    status: poll.status,
    category: poll.category,
    weekLabel: poll.week_label,
    startsAt: poll.starts_at,
    ctaLabel: poll.cta_label,
    options: [options[0], options[1]],
  } satisfies WeeklyPoll;
}
