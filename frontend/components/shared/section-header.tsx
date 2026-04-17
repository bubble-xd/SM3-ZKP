import { cn } from "@/lib/utils";

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  description,
  className
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  description: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">{eyebrow}</p> : null}
      <div className="space-y-3">
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        {subtitle ? <p className="max-w-3xl text-base font-medium leading-7 text-foreground/85 sm:text-lg">{subtitle}</p> : null}
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">{description}</p>
      </div>
    </div>
  );
}
