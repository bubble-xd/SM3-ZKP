"use client";

import { useEffect, useState } from "react";
import { Eraser, LoaderCircle, Sparkles } from "lucide-react";

import { CodeBlock } from "@/components/shared/code-block";
import { MetricCard } from "@/components/shared/metric-card";
import { PageHero } from "@/components/shared/page-hero";
import { ProcessSidebar } from "@/components/shared/process-sidebar";
import { ErrorBadge, StatusPill, type FlowStatus } from "@/components/shared/status-pill";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { postJson } from "@/lib/api";
import { EXAMPLE_MESSAGE } from "@/lib/examples";
import { HashResponse, ProveResponse } from "@/lib/types";
import { formatBytes, formatMs, prettyJson } from "@/lib/utils";

export default function ProvePage() {
  const [message, setMessage] = useState(EXAMPLE_MESSAGE);
  const [status, setStatus] = useState<FlowStatus>("idle");
  const [hashData, setHashData] = useState<HashResponse | null>(null);
  const [proveData, setProveData] = useState<ProveResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isBusy = status === "hashing" || status === "proving";
  const isProving = status === "proving";

  function updateMessage(nextMessage: string) {
    setMessage(nextMessage);
    setProveData(null);
    setError(null);

    if (!nextMessage.trim()) {
      setHashData(null);
      setStatus("idle");
    }
  }

  useEffect(() => {
    if (!message.trim()) {
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        setStatus("hashing");
        const data = await postJson<HashResponse>("/api/hash", { message, encoding: "utf8" });
        setHashData(data);
        setError(null);
        setStatus("idle");
      } catch (caught) {
        setHashData(null);
        setError(caught instanceof Error ? caught.message : "摘要请求失败");
        setStatus("failed");
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [message]);

  async function handleProve() {
    try {
      setStatus("proving");
      setError(null);
      const data = await postJson<ProveResponse>("/api/prove", { message, encoding: "utf8" }, 130000);
      setProveData(data);
      setStatus("done");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "证明生成失败");
      setStatus("failed");
    }
  }

  return (
    <div className="page-frame space-y-8 py-10 sm:py-14">
      <PageHero
        eyebrow="证明控制台"
        title="输入消息，自动计算 SM3，并生成按块证明的 proof bundle"
        subtitle="从原始消息到摘要、状态链和真实 Groth16 证明的一站式工作台"
        badges={["实时摘要", "按块证明", "Groth16", "结果可审查"]}
        stats={[
          {
            label: "输入上限",
            value: `${hashData?.message_length ?? 0} / 247 B`,
            hint: "当前页面按输入内容实时回显长度，并展示 padding 后会占用多少个 SM3 block。"
          },
          {
            label: "证明形态",
          value: `${proveData?.block_count ?? hashData?.block_count ?? 0} 个消息块`,
            hint: "系统会按消息长度自动选择真实 block 数，并复用统一的 step circuit。"
          },
          {
            label: "执行状态",
            value: isBusy ? "处理中" : proveData ? "可复核" : "等待输入",
            hint: "生成完成后可直接查看 proof、public signals、证明耗时和摘要结果。"
          }
        ]}
      />

      <div className="flex flex-wrap items-center gap-3">
        <StatusPill status={status} />
        {error ? <ErrorBadge message={error} /> : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <Card className="mesh-panel">
          <CardHeader>
            <CardTitle>消息输入区</CardTitle>
            <CardDescription>支持当前 4-block 电路范围内的消息，默认最长 247 字节。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea value={message} onChange={(event) => updateMessage(event.target.value)} placeholder="请输入待证明的消息原文、凭据摘要或业务字段..." />
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleProve} disabled={isBusy || !message.trim()}>
                {isProving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                {isProving ? "生成中..." : "生成证明"}
              </Button>
              <Button variant="secondary" onClick={() => updateMessage(EXAMPLE_MESSAGE)} disabled={isBusy}>
                <Sparkles className="h-4 w-4" />
                填充示例
              </Button>
              <Button
                variant="outline"
                disabled={isBusy}
                onClick={() => {
                  updateMessage("");
                }}
              >
                <Eraser className="h-4 w-4" />
                清空
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {isProving
                ? "正在调用 /api/prove 生成真实 Groth16 证明，通常需要等待几秒到几十秒。"
                : "点击“生成证明”后，页面会调用后端 /api/prove 生成真实 proof bundle。"}
            </p>
          </CardContent>
        </Card>

        <ProcessSidebar
          title="证明流程"
          description="本页会触发的按块证明执行链路。"
          steps={[
            { title: "SM3 摘要", body: "后端用 Python 参考实现计算 digest，并导出 padded block / bit 序列。" },
            { title: "步骤输入", body: "后端把消息拆成多个 64-byte block，并为每一块生成 block_bits、state_in_words、state_out_words。" },
            { title: "步骤证明", body: "每个 block 复用同一个压缩 step circuit 生成 witness、proof 和 public signals。" },
            { title: "结果打包", body: "后端把所有 step proof 组装成一个 proof bundle，并汇总总 proving 时间和 proof 大小。" }
          ]}
        />
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="输入载荷"
          value={`${hashData?.message_length ?? 0} B / ${hashData?.block_count ?? 0} 块`}
          description="当前输入长度，以及 padding 后实际占用的 SM3 block 数。"
        />
        <MetricCard label="证明大小" value={formatBytes(proveData?.proof_size_bytes)} description="proof.json 文件大小。" />
        <MetricCard label="Witness 时间" value={formatMs(proveData?.timings.witness_generation_ms)} description="generate_witness.js 执行耗时。" />
        <MetricCard label="Prove 时间" value={formatMs(proveData?.timings.proving_ms)} description="Groth16 证明生成耗时。" />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <CodeBlock title="SM3 摘要" description="自动计算出的哈希值。" value={hashData?.hash_hex ?? ""} />
        <CodeBlock
          title="期望摘要字数组"
          description="公开输入，作为 public signals 的核心内容。"
          value={prettyJson(hashData?.expected_hash_words ?? [])}
        />
        <CodeBlock
          title="Proof JSON"
          description={`后端返回模式：${proveData?.mode ?? "N/A"}`}
          value={prettyJson(proveData?.proof ?? {})}
        />
        <CodeBlock title="公开信号" description="聚合层公开输出，这里默认展示最终 digest words。" value={prettyJson(proveData?.public_signals ?? [])} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <CodeBlock
          title="Padding 后消息 Hex"
          description="SM3 padding 在电路外完成；实际消息会占用 1 到 4 个 block。"
          value={hashData?.padded_message_hex ?? ""}
        />
        <CodeBlock
          title="扩展字预览"
          description="W[0..19] 的十六进制预览，用于排查软件实现与电路输入不一致。"
          value={prettyJson(hashData?.expanded_words_preview ?? [])}
        />
      </section>

    </div>
  );
}
