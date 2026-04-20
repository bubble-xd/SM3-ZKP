import type { Metadata } from "next";

import "@/app/globals.css";
import { SiteShell } from "@/components/layout/site-shell";
import { ThemeProvider } from "@/components/layout/theme-provider";

export const metadata: Metadata = {
  title: {
    default: "隐链卫士",
    template: "%s | 隐链卫士"
  },
  description: "基于国密SM3和零知识证明的实现研究，覆盖摘要计算、证明生成、验证审查与实验观测。"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <SiteShell>{children}</SiteShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
