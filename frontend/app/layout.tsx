import type { Metadata } from "next";

import "@/app/globals.css";
import { SiteShell } from "@/components/layout/site-shell";
import { ThemeProvider } from "@/components/layout/theme-provider";

export const metadata: Metadata = {
  title: "隐链卫士",
  description: "隐链卫士是一个基于 SM3 与 Groth16 的链上数据校验和零知识证明演示平台。"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <SiteShell>{children}</SiteShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
