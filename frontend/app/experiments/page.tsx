"use client";

import { useEffect, useState } from "react";

import { BenchmarkChart } from "@/components/shared/benchmark-chart";
import { PageHero } from "@/components/shared/page-hero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/api";
import { BenchmarkResponse } from "@/lib/types";
import { prettyJson } from "@/lib/utils";

export default function ExperimentsPage() {
  const [benchmark, setBenchmark] = useState<BenchmarkResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiRequest<BenchmarkResponse>("/api/benchmark");
        setBenchmark(data);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "加载 benchmark 数据失败");
      }
    }

    void load();
  }, []);

  function exportJson() {
    if (!benchmark) {
      return;
    }
    const blob = new Blob([prettyJson(benchmark)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "sm3-zkp-benchmark.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="page-frame space-y-8 py-10 sm:py-14">
      <PageHero
        eyebrow="实验分析"
        title="正确性测试、性能对比与结果导出"
        subtitle="围绕可复现性、性能曲线和导出能力的实验展示页"
        description="实验页聚焦可复现性。脚本会按当前电路上限自动选择多档消息长度，并把结果写入 `benchmarks/results/latest.json`。"
        badges={["正确性验证", "性能对比", "JSON 导出", "复现实验"]}
        stats={[
          {
            label: "实验记录",
            value: `${benchmark?.records.length ?? 0} 条`,
            hint: "读取最新 benchmark 结果，用于绘制时延与证明体积的变化曲线。"
          },
          {
            label: "结果文件",
            value: "latest.json",
            hint: "前端与脚本共用同一份输出文件，确保展示结果和离线分析保持一致。"
          },
          {
            label: "导出能力",
            value: benchmark ? "可下载" : "待加载",
            hint: "可以把当前 benchmark 快照导出为 JSON，用于论文材料或实验归档。"
          }
        ]}
      />

      {error ? <Badge variant="danger">{error}</Badge> : null}

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>正确性检查表</CardTitle>
            <CardDescription>平台要求的核心实验项。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>1. 软件 SM3 对照标准向量：abc 与 64-byte abcd... 已在 Python 单元测试中覆盖。</p>
            <p>2. 多块 padding 与 bit 序列转换：backend/tests/test_padding.py 覆盖边界条件与失败 case。</p>
            <p>3. prove / verify 正确性：当工具链与 artifact 就绪后，由 scripts/prove.py、scripts/verify.py 和 benchmark 脚本统一复用。</p>
            <p>4. benchmark 数据导出：实验脚本会生成 results.json 与 latest.json，前端直接读取。</p>
            <div className="pt-2">
              <Button variant="secondary" onClick={exportJson}>
                导出 Benchmark JSON
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Benchmark 表格</CardTitle>
            <CardDescription>不同消息长度的对比结果。</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-muted-foreground">
                <tr className="border-b border-border/70">
                  <th className="px-3 py-2">长度</th>
                  <th className="px-3 py-2">摘要</th>
                  <th className="px-3 py-2">Witness</th>
                  <th className="px-3 py-2">Prove</th>
                  <th className="px-3 py-2">Verify</th>
                  <th className="px-3 py-2">证明大小</th>
                </tr>
              </thead>
              <tbody>
                {(benchmark?.records ?? []).map((record) => (
                  <tr key={record.message_length} className="border-b border-border/40 last:border-0">
                    <td className="px-3 py-3">{record.message_length} B</td>
                    <td className="px-3 py-3 font-mono text-xs">{record.hash_hex.slice(0, 12)}...</td>
                    <td className="px-3 py-3">{record.witness_generation_ms?.toFixed(2) ?? "N/A"}</td>
                    <td className="px-3 py-3">{record.proving_ms?.toFixed(2) ?? "N/A"}</td>
                    <td className="px-3 py-3">{record.verification_ms?.toFixed(2) ?? "N/A"}</td>
                    <td className="px-3 py-3">{record.proof_size_bytes ?? "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <BenchmarkChart
          title="软件哈希时间"
          description="Python 参考实现的哈希耗时。"
          records={benchmark?.records ?? []}
          dataKey="software_hash_ms"
          stroke="#0f766e"
        />
        <BenchmarkChart
          title="证明生成时间"
          description="不同消息长度下的 prove 时间。"
          records={benchmark?.records ?? []}
          dataKey="proving_ms"
          stroke="#0284c7"
        />
        <BenchmarkChart
          title="证明大小"
          description="proof.json 大小对比。"
          records={benchmark?.records ?? []}
          dataKey="proof_size_bytes"
          stroke="#f97316"
        />
      </div>
    </div>
  );
}
