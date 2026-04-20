"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function CodeBlock({
  title,
  description,
  value
}: {
  title: string;
  description?: string;
  value: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        <Button variant="secondary" size="sm" onClick={handleCopy}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "已复制" : "复制"}
        </Button>
      </CardHeader>
      <CardContent>
        <pre className="max-h-[360px] overflow-auto rounded-[1.2rem] border border-cyan-500/10 bg-[linear-gradient(180deg,rgba(2,6,23,0.98),rgba(15,23,42,0.92))] p-4 text-xs leading-6 text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <code>{value || "暂无数据。"}</code>
        </pre>
      </CardContent>
    </Card>
  );
}
