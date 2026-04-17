import { SiteNav } from "@/components/layout/site-nav";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 bg-grid bg-[size:42px_42px] opacity-[0.08]" />
      <SiteNav />
      <main className="relative pb-20">{children}</main>
    </div>
  );
}

