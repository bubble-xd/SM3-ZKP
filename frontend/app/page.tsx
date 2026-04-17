"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Blocks,
  DatabaseZap,
  FileSearch,
  FlaskConical,
  LayoutDashboard,
  LockKeyhole,
  Radar,
  ShieldCheck,
  Sparkles,
  Waypoints,
  Workflow
} from "lucide-react";

import { ProcessSidebar } from "@/components/shared/process-sidebar";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const signalPills = ["链上存证", "隐私核验", "审计复盘"];

const highlightMetrics = [
  {
    label: "消息容量",
    value: "最长 247 B",
    description: "默认支持最多 4 个 SM3 block，适合短消息存证、凭据摘要和结构化字段校验。"
  },
  {
    label: "证明策略",
    value: "按块证明链",
    description: "按 64-byte block 逐步生成证明，再在平台层完成证明链组装与状态校验。"
  },
  {
    label: "平台模块",
    value: "4 个工作区",
    description: "证明生成、结果验证、指标面板和实验分析分区清晰，方便演示与评估。"
  },
  {
    label: "结果形态",
    value: "证明结果包",
    description: "输出最终摘要、逐步证明、公开信号和总耗时，便于复查、归档和展示。"
  }
];

const workspaces = [
  {
    title: "证明工作台",
    description: "输入业务消息，自动完成哈希计算、消息拆块、证明生成和结果展示。",
    href: "/prove",
    icon: LockKeyhole
  },
  {
    title: "验证中心",
    description: "粘贴 proof bundle 与公开信号，检查摘要一致性和整条证明链是否成立。",
    href: "/verify",
    icon: ShieldCheck
  },
  {
    title: "指标面板",
    description: "集中查看约束规模、artifact 状态、证明耗时和参考 proof 大小。",
    href: "/dashboard",
    icon: LayoutDashboard
  },
  {
    title: "实验分析",
    description: "对不同消息长度做批量测试，观察性能变化并导出实验结果。",
    href: "/experiments",
    icon: FlaskConical
  }
];

const scenarios = [
  {
    title: "链上数据存证",
    body: "对隐私消息、业务字段摘要或凭据材料做链上可验证存证，不直接暴露原文内容。",
    icon: BadgeCheck
  },
  {
    title: "跨机构结果核验",
    body: "把“我确实持有某份数据”转换为可交叉验证的证明结果，降低协作过程中的数据暴露。",
    icon: Waypoints
  },
  {
    title: "审计与复盘",
    body: "保留摘要、公开信号、逐步证明和性能指标，便于做演示汇报、审计追踪和问题定位。",
    icon: FileSearch
  }
];

const foundations = [
  {
    title: "密码内核",
    body: "SM3 压缩 step circuit 与 Groth16 证明流程共同构成平台的证明底座。",
    icon: Blocks
  },
  {
    title: "服务编排",
    body: "FastAPI 负责哈希计算、step 输入构造、proof bundle 组装和统一校验接口。",
    icon: DatabaseZap
  },
  {
    title: "流程可视化",
    body: "首页、工作台、验证页和指标面板共享同一套信息结构，方便对外展示。",
    icon: Radar
  },
  {
    title: "实验闭环",
    body: "从功能演示到 benchmark 导出都在同一平台内完成，不需要拆成多套工具。",
    icon: Workflow
  }
];

export default function HomePage() {
  return (
    <div className="page-frame space-y-12 py-8 sm:space-y-14 sm:py-12">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/72 shadow-soft backdrop-blur-xl">
        <div className="hero-grid pointer-events-none absolute inset-0 opacity-60" />
        <div className="pointer-events-none absolute -left-16 top-10 h-56 w-56 rounded-full bg-sky-300/20 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-amber-200/30 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-cyan-200/20 blur-3xl" />

        <div className="relative grid gap-6 p-6 sm:p-8 xl:grid-cols-[1.35fr_0.92fr] xl:p-10">
          <div className="space-y-8">
            <div className="flex flex-wrap gap-2">
              {signalPills.map((pill) => (
                <span
                  key={pill}
                  className="inline-flex items-center rounded-full border border-primary/15 bg-primary/6 px-4 py-1.5 text-xs font-semibold tracking-[0.16em] text-primary"
                >
                  {pill}
                </span>
              ))}
            </div>

            <div className="space-y-5">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">链上隐私证明平台</p>
              <div className="space-y-3">
                <h1 className="font-heading text-5xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-6xl lg:text-7xl xl:text-[5.5rem]">
                  隐链卫士
                </h1>
                <p className="max-w-3xl text-2xl font-semibold leading-tight text-slate-800 sm:text-3xl">
                  用 SM3 与零知识证明保护链上数据
                </p>
              </div>
              <p className="max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
                把消息校验、证明生成、结果验证、指标面板和实验分析整合成一个完整平台，适合做链上数据保护演示、原型验证、性能评估和审计复盘。
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-14 px-8 text-lg">
                <Link href="/prove">
                  进入证明工作台
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="h-14 px-8 text-lg">
                <Link href="/verify">打开验证中心</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg">
                <Link href="/dashboard">查看指标面板</Link>
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {highlightMetrics.map((metric) => (
                <div key={metric.label}>
                  <Card className="h-full border-white/80 bg-white/78 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                    <CardHeader className="pb-3">
                      <CardDescription className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/90">
                        {metric.label}
                      </CardDescription>
                      <CardTitle className="text-3xl leading-tight sm:text-[2rem]">{metric.value}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-7 text-muted-foreground">{metric.description}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          <Card className="hero-shell relative overflow-hidden border-white/80 shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-sky-200/35 via-transparent to-amber-200/30" />
            <CardHeader className="space-y-3">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-foreground/8 bg-white/75 px-3 py-1 text-xs font-semibold text-slate-700">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                平台总览
              </div>
              <CardTitle className="text-3xl sm:text-[2rem]">从消息录入到结果审查的一体化工作流</CardTitle>
              <CardDescription className="text-sm leading-7">
                首页不是单一按钮入口，而是整个平台的总控台。你可以从这里直接进入证明、验证、指标和实验四个工作区。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {workspaces.slice(0, 3).map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="flex items-start gap-4 rounded-[1.25rem] border border-border/60 bg-white/72 p-4 transition hover:-translate-y-0.5 hover:border-primary/35 hover:bg-white"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <p className="font-heading text-lg font-semibold">{item.title}</p>
                      <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                  </Link>
                );
              })}

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.25rem] border border-border/60 bg-white/72 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">证明链</p>
                  <p className="mt-2 text-2xl font-heading font-semibold">1-4</p>
                  <p className="mt-1 text-sm text-muted-foreground">按消息长度自动确定实际 block 数。</p>
                </div>
                <div className="rounded-[1.25rem] border border-border/60 bg-white/72 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">验证方式</p>
                  <p className="mt-2 text-2xl font-heading font-semibold">全链校验</p>
                  <p className="mt-1 text-sm text-muted-foreground">检查摘要一致性与整条状态链连接关系。</p>
                </div>
                <div className="rounded-[1.25rem] border border-border/60 bg-white/72 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">演示能力</p>
                  <p className="mt-2 text-2xl font-heading font-semibold">可视化</p>
                  <p className="mt-1 text-sm text-muted-foreground">前端直接展示 proof bundle、指标和实验结果。</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeader
          eyebrow="核心工作区"
          title="四个工作区，覆盖完整平台流程"
          description="从发起证明到结果复核，再到性能观察和实验导出，都有独立入口与明确职责，适合做平台化展示。"
        />

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {workspaces.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title}>
                <Link href={item.href} className="block h-full">
                  <Card className="group h-full border-white/80 bg-white/80 transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
                    <CardHeader className="space-y-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-2">
                        <CardTitle className="text-2xl">{item.title}</CardTitle>
                        <CardDescription className="leading-7">{item.description}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between pt-2">
                      <span className="text-sm font-medium text-primary">进入工作区</span>
                      <ArrowRight className="h-4 w-4 text-primary transition group-hover:translate-x-1" />
                    </CardContent>
                  </Card>
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div>
          <Card className="mesh-panel h-full overflow-hidden">
            <CardHeader className="space-y-3">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/15 bg-primary/6 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                <Radar className="h-3.5 w-3.5" />
                应用场景
              </div>
              <CardTitle className="text-3xl">这不是单点工具，而是面向展示与审查的平台</CardTitle>
              <CardDescription className="leading-7">
                首页需要回答“这个平台能解决什么问题”。相比直接露出底层字段结构，更应该先告诉用户它适合在哪些场景里使用。
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              {scenarios.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-[1.4rem] border border-white/80 bg-white/76 p-5 shadow-soft">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 font-heading text-xl font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.body}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div>
          <ProcessSidebar
            title="平台流程"
            description="用更贴近业务的语言解释从输入到证明的完整执行路径。"
            steps={[
              { title: "录入待保护消息", body: "平台接收文本、编码后的消息或业务字段摘要，并先给出可见的 SM3 结果。" },
              { title: "拆分与构造证明链", body: "系统把消息 padding 后按块拆分，为每一块准备状态输入、状态输出和证明输入。" },
              { title: "逐步生成证明", body: "每一块复用同一套压缩电路生成 step proof，避免因为单个大电路而让体积继续膨胀。" },
              { title: "汇总、验证与展示", body: "平台把 step proof 汇总成 proof bundle，并统一展示摘要、信号、时间、大小和实验指标。" }
            ]}
          />
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeader
          eyebrow="能力底座"
          title="平台底座"
          description="底层能力仍然完整保留，但首页只展示真正有判断价值的信息：能力边界、工作流和可审查性。"
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {foundations.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle>{item.title}</CardTitle>
                    <CardDescription className="leading-7">{item.body}</CardDescription>
                  </CardHeader>
                </Card>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
