import type { LucideIcon } from "lucide-react";

type ReferenceItem = {
  icon: LucideIcon;
  label: string;
  description: string;
};

interface ReferencePanelProps {
  eyebrow?: string;
  title: string;
  items: ReferenceItem[];
  columns?: 2 | 3;
}

export function ReferencePanel({
  eyebrow,
  title,
  items,
  columns = 3,
}: ReferencePanelProps) {
  return (
    <section className="rounded-xl border border-white/8 bg-card p-5 sm:p-6">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="mb-3 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-accent/85">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-2xl font-bold text-white">{title}</h2>
      </div>

      <div className={`mt-5 grid gap-3 ${columns === 2 ? "lg:grid-cols-2" : "lg:grid-cols-3"}`}>
        {items.map(({ icon: Icon, label, description }) => (
          <div key={label} className="rounded-lg border border-white/8 bg-white/[0.03] p-4">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-white">
              <Icon className="h-4 w-4 text-accent" />
              {label}
            </div>
            <p className="mt-2 text-sm leading-6 text-white/52">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
