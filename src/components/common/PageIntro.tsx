import type { ReactNode } from "react";

interface PageIntroProps {
  eyebrow?: string;
  title: string;
  description: string;
  meta?: ReactNode;
  actions?: ReactNode;
}

export function PageIntro({ eyebrow, title, description, meta, actions }: PageIntroProps) {
  return (
    <section className="space-y-3 pt-1 sm:pt-2">
      {eyebrow && (
        <p className="text-[0.68rem] font-medium uppercase tracking-[0.18em] text-accent/85">
          {eyebrow}
        </p>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <h1 className="font-display text-[clamp(2rem,4vw,3.2rem)] font-bold leading-[0.94] text-white">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-[0.98rem] leading-relaxed text-white/55">
            {description}
          </p>
        </div>

        {(meta || actions) && (
          <div className="flex flex-col items-start gap-3 text-sm lg:items-end">
            {meta && <div className="text-white/42">{meta}</div>}
            {actions}
          </div>
        )}
      </div>
    </section>
  );
}
