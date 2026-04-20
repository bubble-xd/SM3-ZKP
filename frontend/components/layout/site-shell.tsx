import { SiteNav } from "@/components/layout/site-nav";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 bg-grid bg-[size:42px_42px] opacity-[0.08]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[24rem] bg-gradient-to-b from-sky-300/10 via-transparent to-transparent dark:from-cyan-400/8" />
      <div className="pointer-events-none absolute left-[-6rem] top-24 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl dark:bg-cyan-400/10" />
      <div className="pointer-events-none absolute right-[-5rem] top-32 h-72 w-72 rounded-full bg-amber-300/10 blur-3xl dark:bg-amber-300/5" />
      <SiteNav />
      <main className="relative pb-20">{children}</main>
    </div>
  );
}
