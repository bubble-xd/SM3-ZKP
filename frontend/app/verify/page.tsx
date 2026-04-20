"use client";

import { useState } from "react";

import { CodeBlock } from "@/components/shared/code-block";
import { PageHero } from "@/components/shared/page-hero";
import { ProcessSidebar } from "@/components/shared/process-sidebar";
import { ErrorBadge, StatusPill, type FlowStatus } from "@/components/shared/status-pill";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { postJson } from "@/lib/api";
import { EXAMPLE_HASH } from "@/lib/examples";
import { VerifyResponse } from "@/lib/types";
import { prettyJson, safeJsonParse } from "@/lib/utils";

export default function VerifyPage() {
  const [status, setStatus] = useState<FlowStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [hash, setHash] = useState(EXAMPLE_HASH);
  const [proofText, setProofText] = useState("{}");
  const [signalsText, setSignalsText] = useState("[]");
  const [result, setResult] = useState<VerifyResponse | null>(null);

  async function handleVerify() {
    try {
      setStatus("verifying");
      setError(null);
      const proof = safeJsonParse<Record<string, unknown>>(proofText);
      const publicSignals = safeJsonParse<Array<string | number>>(signalsText);
      const data = await postJson<VerifyResponse>("/api/verify", {
        expected_hash: hash,
        proof,
        public_signals: publicSignals
      });
      setResult(data);
      setStatus("done");
    } catch (caught) {
      setResult(null);
      setError(caught instanceof Error ? caught.message : "验证请求失败");
      setStatus("failed");
    }
  }

  return (
    <div className="page-frame space-y-8 py-10 sm:py-14">
      <PageHero
        eyebrow="验证控制台"
        title="提交 expected hash、proof bundle 和 public signals，验证整条证明链是否成立"
        subtitle="适合单独做结果复核、链路校验和外部演示审查"
        description="验证页适合单独复核 proof bundle。输入框支持直接粘贴后端返回的 JSON，并验证摘要、状态链和 Groth16 结果。"
        badges={["摘要一致性", "状态链校验", "Groth16 Verify", "结果复审"]}
        stats={[
          {
            label: "输入形态",
            value: "摘要 + 证明 + 信号",
            hint: "验证所需字段被明确拆分，便于从不同系统粘贴进来做独立检查。"
          },
          {
            label: "验证重点",
            value: result?.verified ? "已通过" : "待校验",
            hint: "平台会同时检查首块 IV、链式连接关系和最终摘要输出。"
          },
          {
            label: "当前状态",
            value: status === "verifying" ? "验证中" : error ? "有异常" : "可执行",
            hint: "出现错误时会直接把后端返回的校验异常展示在页面顶部。"
          }
        ]}
      />

      <div className="flex flex-wrap items-center gap-3">
        <StatusPill status={status} />
        {error ? <ErrorBadge message={error} /> : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <Card className="mesh-panel">
          <CardHeader>
            <CardTitle>验证输入区</CardTitle>
            <CardDescription>proof 和 public signals 必须是有效 JSON，并且来自 `/api/prove` 返回的真实证明结果。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input value={hash} onChange={(event) => setHash(event.target.value)} placeholder="请输入 64 位 expected hash" />
            <Textarea value={proofText} onChange={(event) => setProofText(event.target.value)} placeholder="粘贴 proof JSON" />
            <Textarea value={signalsText} onChange={(event) => setSignalsText(event.target.value)} placeholder="粘贴 public signals JSON" />
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleVerify}>开始验证</Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setHash(EXAMPLE_HASH);
                  setProofText("{}");
                  setSignalsText("[]");
                }}
              >
                填充摘要
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setHash("");
                  setProofText("{}");
                  setSignalsText("[]");
                  setResult(null);
                  setStatus("idle");
                  setError(null);
                }}
              >
                清空
              </Button>
            </div>
          </CardContent>
        </Card>

        <ProcessSidebar
          title="验证逻辑"
          description="后端验证 proof bundle 时会执行的检查。"
          steps={[
            { title: "JSON 解析", body: "前端解析 proof/public signals，后端再做 schema 校验。" },
            { title: "链路检查", body: "后端会检查首块输入状态是否为 IV，前后 step 的状态是否首尾相接。" },
            { title: "摘要交叉校验", body: "验证接口会把最后一个 step 的输出状态与 expected hash / public signals 做一致性校验。" },
            { title: "Groth16 校验", body: "后端会逐块调用 snarkjs 与 verification key 做真实校验；缺少工具链或电路产物时会直接报错。" }
          ]}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CodeBlock title="Proof 输入" description="待验证的 proof bundle JSON。" value={proofText} />
        <CodeBlock title="Public Signals 输入" description="聚合层公开输出，默认是最终 digest words。" value={signalsText} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>验证结果</CardTitle>
          <CardDescription>结果会显示在 data.verified 字段中。</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="rounded-[1.2rem] border border-border/70 bg-slate-950/95 p-4 text-xs leading-6 text-slate-100">
            <code>{prettyJson(result ?? { verified: null })}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
