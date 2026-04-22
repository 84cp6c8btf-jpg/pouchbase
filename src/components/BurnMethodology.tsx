import { Flame } from "lucide-react";
import { BURN_SCALE } from "@/components/BurnMeter";

interface BurnMethodologyProps {
  compact?: boolean;
}

export function BurnMethodology({ compact = false }: BurnMethodologyProps) {
  return (
    <section className="rounded-xl border border-white/8 bg-card p-5 sm:p-6">
      <div className="flex flex-col gap-5">
        <div className="max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-accent/85">
            <Flame className="h-3.5 w-3.5" />
            Burn Methodology
          </div>
          <h2 className="font-display text-2xl font-bold leading-tight text-white">
            Burn tracks felt sting under the lip, not just nicotine milligrams.
          </h2>
          <p className="mt-3 text-sm leading-7 text-white/55">
            PouchBase burn scores come from community reviews of perceived intensity. Moisture,
            flavoring, recipe, and pouch construction can make a lower-mg pouch feel harsher than
            a stronger one.
          </p>
        </div>

        <div className={`grid gap-2 ${compact ? "sm:grid-cols-3 lg:grid-cols-5" : "sm:grid-cols-2 lg:grid-cols-5"}`}>
          {BURN_SCALE.map((step) => (
            <div key={step.label} className="rounded-lg border border-white/8 bg-white/[0.03] px-3 py-3">
              <div className="text-[0.68rem] uppercase tracking-[0.16em] text-white/38">{step.range}</div>
              <div className="mt-1 font-display text-lg font-bold text-white">{step.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
