"use client";

import { useState } from "react";

import { CodeBlock } from "@/components/shared/code-block";
import { ProcessSidebar } from "@/components/shared/process-sidebar";
import { SectionHeader } from "@/components/shared/section-header";
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
      setError(caught instanceof Error ? caught.message : "Verify request failed");
      setStatus("failed");
    }
  }

  return (
    <div className="page-frame space-y-8 py-10 sm:py-14">
      <SectionHeader
        eyebrow="Verify Proof"
        title="提交 expected hash、proof bundle 和 public signals，验证整条证明链是否成立"
        description="验证页适合单独复核 proof bundle。输入框支持直接粘贴后端返回的 JSON。"
      />

      <div className="flex flex-wrap items-center gap-3">
        <StatusPill status={status} />
        {error ? <ErrorBadge message={error} /> : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <Card className="mesh-panel">
          <CardHeader>
            <CardTitle>Verification Inputs</CardTitle>
            <CardDescription>proof 和 public signals 必须是有效 JSON，并且来自 `/api/prove` 返回的真实证明结果。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input value={hash} onChange={(event) => setHash(event.target.value)} placeholder="Expected hash (hex)" />
            <Textarea value={proofText} onChange={(event) => setProofText(event.target.value)} placeholder="Paste proof JSON" />
            <Textarea value={signalsText} onChange={(event) => setSignalsText(event.target.value)} placeholder="Paste public signals JSON" />
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleVerify}>Verify Proof</Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setHash(EXAMPLE_HASH);
                  setProofText("{}");
                  setSignalsText("[]");
                }}
              >
                Fill Hash
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
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        <ProcessSidebar
          title="Verification Logic"
          description="后端验证 proof bundle 时做的检查。"
          steps={[
            { title: "JSON Parse", body: "前端解析 proof/public signals，后端再做 schema 校验。" },
            { title: "Chain Check", body: "后端会检查首块输入状态是否为 IV，前后 step 的状态是否首尾相接。" },
            { title: "Hash Cross-check", body: "验证接口会把最后一个 step 的输出状态与 expected hash / public signals 做一致性校验。" },
            { title: "Groth16 Verify", body: "后端会逐块调用 snarkjs 与 verification key 做真实校验；缺少工具链或电路产物时会直接报错。" }
          ]}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CodeBlock title="Proof Input" description="待验证的 proof bundle JSON。" value={proofText} />
        <CodeBlock title="Public Signals Input" description="聚合层公开输出，默认是最终 digest words。" value={signalsText} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Verification Result</CardTitle>
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
