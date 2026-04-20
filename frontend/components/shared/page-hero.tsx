import { cn } from "@/lib/utils";

type HeroStat = {
  label: string;
  value: string;
  hint: string;
};

export function PageHero({
  eyebrow,
  title,
  subtitle,
  description,
  badges = [],
  stats = [],
  className
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  description?: string;
  badges?: string[];
  stats?: HeroStat[];
  className?: string;
}) {
  return (
    <section className={cn("page-hero-shell", className)}>
      <div className="page-hero-grid">
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {badges.map((badge) => (
              <span key={badge} className="hero-chip">
                {badge}
              </span>
            ))}
          </div>
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/90">{eyebrow}</p>
            <div className="space-y-3">
              <h1 className="font-heading text-4xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-5xl lg:text-6xl dark:text-white">
                {title}
              </h1>
              <p className="max-w-3xl text-xl font-semibold leading-tight text-slate-800 sm:text-2xl dark:text-slate-100">
                {subtitle}
              </p>
            </div>
            {description ? <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">{description}</p> : null}
          </div>
        </div>

        {stats.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {stats.map((stat) => (
              <div key={stat.label} className="hero-stat-card">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/85">{stat.label}</p>
                <p className="mt-3 font-heading text-2xl font-semibold text-slate-950 dark:text-white">{stat.value}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{stat.hint}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
