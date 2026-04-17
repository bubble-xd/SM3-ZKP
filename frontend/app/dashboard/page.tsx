"use client";

import { useEffect, useState } from "react";

import { BenchmarkChart } from "@/components/shared/benchmark-chart";
import { MetricCard } from "@/components/shared/metric-card";
import { SectionHeader } from "@/components/shared/section-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/api";
import { BenchmarkResponse, CircuitMetaResponse } from "@/lib/types";
import { formatBytes } from "@/lib/utils";

export default function DashboardPage() {
  const [meta, setMeta] = useState<CircuitMetaResponse | null>(null);
  const [benchmark, setBenchmark] = useState<BenchmarkResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [metaData, benchmarkData] = await Promise.all([
          apiRequest<CircuitMetaResponse>("/api/circuit/meta"),
          apiRequest<BenchmarkResponse>("/api/benchmark")
        ]);
        setMeta(metaData);
        setBenchmark(benchmarkData);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Failed to load dashboard data");
      }
    }

    void load();
  }, []);

  const firstBenchmark = benchmark?.records.find((record) => record.success);

  return (
    <div className="page-frame space-y-8 py-10 sm:py-14">
      <SectionHeader
        eyebrow="Dashboard"
        title="约束规模、artifact 状态和 benchmark 指标"
        description="这一页聚合 /api/circuit/meta 和 /api/benchmark 的结果，用于快速判断 step circuit 工具链是否就绪、artifact 是否生成，以及不同消息长度下 proof bundle 的性能表现。"
      />

      {error ? <Badge variant="danger">{error}</Badge> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Max Message"
          value={`${meta?.max_message_length ?? 247} B`}
          description={`当前电路最多允许 ${meta?.max_blocks ?? 4} 个 SM3 block 的原像长度。`}
        />
        <MetricCard label="Constraints" value={meta?.constraints?.toLocaleString() ?? "Pending"} description="由 setup 后导出的 R1CS 约束数。" />
        <MetricCard label="Proving Key" value={formatBytes(meta?.proving_key_bytes)} description="final zkey 大小。" />
        <MetricCard label="Reference Proof" value={formatBytes(firstBenchmark?.proof_size_bytes)} description="最近一次 benchmark 记录里的 proof 大小。" />
      </section>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Toolchain & Artifacts</CardTitle>
            <CardDescription>本地环境与关键证明文件状态。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <Badge variant={meta?.toolchain.node ? "success" : "danger"}>Node</Badge>
              <Badge variant={meta?.toolchain.circom ? "success" : "danger"}>Circom</Badge>
              <Badge variant={meta?.toolchain.snarkjs ? "success" : "danger"}>snarkjs</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant={meta?.artifact_status.r1cs ? "success" : "warning"}>R1CS</Badge>
              <Badge variant={meta?.artifact_status.wasm ? "success" : "warning"}>WASM</Badge>
              <Badge variant={meta?.artifact_status.zkey ? "success" : "warning"}>ZKey</Badge>
              <Badge variant={meta?.artifact_status.vkey ? "success" : "warning"}>VKey</Badge>
            </div>
            <div className="space-y-2">
              {(meta?.notes ?? ["No notes available."]).map((note) => (
                <p key={note} className="text-sm leading-6 text-muted-foreground">
                  {note}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle>Benchmark Snapshot</CardTitle>
            <CardDescription>{benchmark?.summary.generated_at_utc ?? "No benchmark run yet."}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <MetricCard
              label="Witness"
              value={firstBenchmark?.witness_generation_ms ? `${firstBenchmark.witness_generation_ms.toFixed(2)} ms` : "N/A"}
              description="最近一条成功记录中的 witness 生成时间。"
            />
            <MetricCard
              label="Verify"
              value={firstBenchmark?.verification_ms ? `${firstBenchmark.verification_ms.toFixed(2)} ms` : "N/A"}
              description="最近一条成功记录中的 proof 验证时间。"
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <BenchmarkChart
          title="Witness Generation Time"
          description="不同消息长度下的 witness 生成时间。"
          records={benchmark?.records ?? []}
          dataKey="witness_generation_ms"
          stroke="#06b6d4"
        />
        <BenchmarkChart
          title="Proving Time"
          description="Groth16 prove 阶段耗时。"
          records={benchmark?.records ?? []}
          dataKey="proving_ms"
          stroke="#0ea5e9"
        />
        <BenchmarkChart
          title="Verification Time"
          description="Groth16 verify 阶段耗时。"
          records={benchmark?.records ?? []}
          dataKey="verification_ms"
          stroke="#f59e0b"
        />
      </div>
    </div>
  );
}
