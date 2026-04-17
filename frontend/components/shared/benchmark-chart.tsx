"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BenchmarkRecord } from "@/lib/types";

type BenchmarkKey = "software_hash_ms" | "witness_generation_ms" | "proving_ms" | "verification_ms" | "proof_size_bytes";

export function BenchmarkChart({
  title,
  description,
  records,
  dataKey,
  stroke
}: {
  title: string;
  description: string;
  records: BenchmarkRecord[];
  dataKey: BenchmarkKey;
  stroke: string;
}) {
  const data = records
    .filter((record) => typeof record[dataKey] === "number")
    .map((record) => ({
      messageLength: record.message_length,
      value: record[dataKey] as number
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="h-[280px]">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-[1.2rem] border border-dashed border-border/80 bg-secondary/40 text-sm text-muted-foreground">
            Run the benchmark script to populate this chart.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`${dataKey}-gradient`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={stroke} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={stroke} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
              <XAxis dataKey="messageLength" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} width={80} />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke={stroke} fill={`url(#${dataKey}-gradient)`} strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

