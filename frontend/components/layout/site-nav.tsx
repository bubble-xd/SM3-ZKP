"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Binary, Gauge, Hexagon, ShieldCheck } from "lucide-react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Home" },
  { href: "/prove", label: "Prove" },
  { href: "/verify", label: "Verify" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/experiments", label: "Experiments" }
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="page-frame flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Binary className="h-5 w-5" />
          </div>
          <div>
            <p className="font-heading text-sm font-semibold">隐链卫士</p>
            <p className="text-xs text-muted-foreground">用 SM3 与零知识证明保护链上数据</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm transition",
                  active ? "bg-primary/12 text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full border border-border/70 px-3 py-1 text-xs text-muted-foreground md:flex">
            <Hexagon className="h-3.5 w-3.5" />
            Circom 2
            <Gauge className="h-3.5 w-3.5" />
            Groth16
            <ShieldCheck className="h-3.5 w-3.5" />
            FastAPI + Next
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
