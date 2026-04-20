"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Binary, FileCode2, Gauge, Hexagon, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "总览" },
  { href: "/prove", label: "证明生成" },
  { href: "/verify", label: "证明验证" },
  { href: "/dashboard", label: "指标面板" },
  { href: "/experiments", label: "实验分析" }
];

export function SiteNav() {
  const pathname = usePathname();
  const docsHref = `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"}/docs`;

  return (
    <header className="sticky top-0 z-40 pt-3">
      <div className="page-frame">
        <div className="product-card rounded-[1.8rem] border border-white/60 dark:border-white/10">
          <div className="flex min-h-[72px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <Link href="/" className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-cyan-300 shadow-[0_12px_40px_-20px_rgba(2,6,23,0.85)]">
                <Binary className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="font-heading text-base font-semibold tracking-tight">隐链卫士</p>
                <p className="truncate text-xs text-muted-foreground">SM3 Zero-Knowledge Gateway</p>
              </div>
            </Link>

            <nav className="hidden items-center gap-1 rounded-full border border-black/5 bg-black/[0.03] p-1 xl:flex dark:border-white/10 dark:bg-white/5">
              {items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-full px-4 py-2 text-sm font-medium transition",
                      active
                        ? "bg-slate-950 text-cyan-300 shadow-[0_16px_40px_-28px_rgba(2,6,23,0.8)]"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-full border border-black/5 bg-black/[0.03] px-3 py-1 text-xs text-muted-foreground lg:flex dark:border-white/10 dark:bg-white/5">
                <Hexagon className="h-3.5 w-3.5" />
                Circom 2
                <Gauge className="h-3.5 w-3.5" />
                Groth16
                <ShieldCheck className="h-3.5 w-3.5" />
                FastAPI + Next
              </div>
              <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link href="/prove">开始证明</Link>
              </Button>
              <Button asChild variant="secondary" size="sm" className="hidden md:inline-flex">
                <a href={docsHref} target="_blank" rel="noreferrer">
                  <FileCode2 className="h-4 w-4" />
                  接口文档
                </a>
              </Button>
              <ThemeToggle />
            </div>
          </div>

          <nav className="flex gap-2 overflow-x-auto px-4 pb-4 xl:hidden sm:px-6">
            {items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition",
                    active
                      ? "bg-slate-950 text-cyan-300 shadow-[0_16px_40px_-28px_rgba(2,6,23,0.8)]"
                      : "bg-black/[0.03] text-muted-foreground dark:bg-white/5 dark:text-muted-foreground"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <a
              href={docsHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-black/5 bg-black/[0.03] px-4 py-2 text-sm font-medium text-muted-foreground dark:border-white/10 dark:bg-white/5"
            >
              <FileCode2 className="h-4 w-4" />
              接口文档
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
