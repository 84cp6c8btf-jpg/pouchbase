import Link from "next/link";
import { getBurnLabel, formatBurnRating } from "@/lib/burn";
import {
  getBrand,
  type ProductWithBrand,
} from "@/lib/discovery";
import {
  getBurnStrengthPoints,
  getBurnStrengthSignalLabel,
  getBurnStrengthSignalTone,
} from "@/lib/intelligence";

interface BurnVsStrengthMapProps {
  products: ProductWithBrand[];
  title?: string;
  description?: string;
  compact?: boolean;
}

export function BurnVsStrengthMap({
  products,
  title = "Burn vs nicotine",
  description = "Map products by nicotine strength and felt burn to show where recipes stay smooth, where they bite harder, and where similar mg levels split apart.",
  compact = false,
}: BurnVsStrengthMapProps) {
  const points = getBurnStrengthPoints(products);

  if (points.length === 0) {
    return (
      <section className="rounded-xl border border-white/8 bg-card p-5 sm:p-6">
        <div className="max-w-3xl">
          <div className="text-[0.68rem] uppercase tracking-[0.18em] text-accent/85">
            Burn Intelligence
          </div>
          <h2 className="mt-2 font-display text-2xl font-bold text-white">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-white/54">{description}</p>
        </div>

        <div className="mt-5 rounded-lg border border-dashed border-white/10 bg-white/[0.02] px-4 py-5">
          <p className="text-sm leading-7 text-white/56">
            Not enough real public-score review data yet to map burn against nicotine strength.
            This surface turns on once products reach the structured-review threshold and there are
            enough nearby-strength comparisons to say something honest.
          </p>
        </div>
      </section>
    );
  }

  const width = 720;
  const height = compact ? 260 : 320;
  const paddingX = 40;
  const paddingTop = 24;
  const paddingBottom = 30;
  const minMg = Math.min(...points.map((point) => point.product.strength_mg));
  const maxMg = Math.max(...points.map((point) => point.product.strength_mg));
  const mgRange = Math.max(1, maxMg - minMg);

  const highlighted = points
    .filter((point) => point.signal)
    .sort(
      (left, right) =>
        Math.abs(right.deviation || 0) - Math.abs(left.deviation || 0) ||
        right.product.review_count - left.product.review_count
    )
    .slice(0, compact ? 4 : 6);

  return (
    <section className="rounded-xl border border-white/8 bg-card p-5 sm:p-6">
      <div className="max-w-3xl">
        <div className="text-[0.68rem] uppercase tracking-[0.18em] text-accent/85">
          Burn Intelligence
        </div>
        <h2 className="mt-2 font-display text-2xl font-bold text-white">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-white/54">{description}</p>
      </div>

      <div className={`mt-5 grid gap-5 ${compact ? "xl:grid-cols-[1.1fr_0.9fr]" : "xl:grid-cols-[1.3fr_0.7fr]"}`}>
        <div className="rounded-lg border border-white/8 bg-white/[0.02] p-4">
          <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label="Burn versus nicotine map">
            <line
              x1={paddingX}
              y1={height - paddingBottom}
              x2={width - paddingX}
              y2={height - paddingBottom}
              className="stroke-white/12"
              strokeWidth="1"
            />
            <line
              x1={paddingX}
              y1={paddingTop}
              x2={paddingX}
              y2={height - paddingBottom}
              className="stroke-white/12"
              strokeWidth="1"
            />

            {[0, 2.5, 5, 7.5, 10].map((burn) => {
              const y =
                height -
                paddingBottom -
                (burn / 10) * (height - paddingTop - paddingBottom);

              return (
                <g key={burn}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={width - paddingX}
                    y2={y}
                    className="stroke-white/8"
                    strokeWidth="1"
                  />
                  <text x={12} y={y + 4} className="fill-white/38 text-[12px]">
                    {burn.toFixed(1)}
                  </text>
                </g>
              );
            })}

            {[minMg, minMg + mgRange / 2, maxMg].map((mg, index) => {
              const x =
                paddingX + ((mg - minMg) / mgRange) * (width - paddingX * 2);

              return (
                <text
                  key={`${mg}-${index}`}
                  x={x}
                  y={height - 8}
                  textAnchor="middle"
                  className="fill-white/38 text-[12px]"
                >
                  {Math.round(mg)}mg
                </text>
              );
            })}

            <text x={width / 2} y={height} textAnchor="middle" className="fill-white/44 text-[12px]">
              Nicotine strength
            </text>
            <text
              x={12}
              y={14}
              className="fill-white/44 text-[12px]"
            >
              Burn score
            </text>

            {points.map((point) => {
              const x =
                paddingX +
                ((point.product.strength_mg - minMg) / mgRange) * (width - paddingX * 2);
              const y =
                height -
                paddingBottom -
                (point.product.avg_burn / 10) * (height - paddingTop - paddingBottom);
              const tone = point.signal
                ? getBurnStrengthSignalTone(point.signal)
                : getBurnStrengthSignalTone("balanced");

              return (
                <circle
                  key={point.product.id}
                  cx={x}
                  cy={y}
                  r={point.signal === "outlier" ? 6 : 5}
                  className={tone.dotClass}
                  fillOpacity={point.signal === "balanced" ? 0.72 : 0.92}
                />
              );
            })}
          </svg>

          <div className="mt-4 flex flex-wrap gap-2">
            {["hot-for-mg", "smooth-for-mg", "balanced", "outlier"].map((signal) => {
              const tone = getBurnStrengthSignalTone(signal as Parameters<typeof getBurnStrengthSignalTone>[0]);

              return (
                <div
                  key={signal}
                  className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs ${tone.chipClass}`}
                >
                  <span className={`h-2 w-2 rounded-full ${tone.dotClass.replace("fill-", "bg-")}`} />
                  {getBurnStrengthSignalLabel(signal as Parameters<typeof getBurnStrengthSignalLabel>[0])}
                </div>
              );
            })}
          </div>

          <p className="mt-3 text-xs leading-6 text-white/40">
            Signal compares each product against nearby-strength public-score products, so the map shows when similar mg levels land very differently under the lip.
          </p>
        </div>

        <div className="space-y-3">
          {highlighted.map((point) => {
            if (!point.signal || point.deviation === null) return null;

            const brand = getBrand(point.product);
            const tone = getBurnStrengthSignalTone(point.signal);

            return (
              <Link
                key={point.product.id}
                href={`/pouches/${point.product.slug}`}
                className="block rounded-lg border border-white/8 bg-white/[0.03] p-4 transition hover:border-white/16"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[0.68rem] uppercase tracking-[0.16em] text-white/38">
                      {brand?.name}
                    </div>
                    <div className="mt-1 font-display text-lg font-bold text-white">
                      {point.product.name}
                    </div>
                  </div>
                  <span className={`rounded-md border px-2.5 py-1 text-[0.68rem] uppercase tracking-[0.14em] ${tone.chipClass}`}>
                    {getBurnStrengthSignalLabel(point.signal)}
                  </span>
                </div>

                <p className="mt-2 text-sm leading-6 text-white/52">
                  {point.product.strength_mg}mg · Burn {formatBurnRating(point.product.avg_burn)} · {getBurnLabel(point.product.avg_burn)}
                </p>
                <p className="mt-1 text-sm text-white/42">
                  Cohort burn {formatBurnRating(point.cohortAverageBurn || 0)} · {point.deviation > 0 ? "+" : ""}
                  {formatBurnRating(point.deviation)}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
