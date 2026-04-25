import { getBrand, type ProductWithBrand } from "@/lib/catalog/discovery";

export type PollCategory = "burn" | "flavor" | "value" | "packaging";
export type PollStatus = "draft" | "active" | "archived";

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
  return null;
}
