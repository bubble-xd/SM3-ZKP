"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  Blocks,
  DatabaseZap,
  FileSearch,
  FlaskConical,
  Gauge,
  LayoutDashboard,
  LockKeyhole,
  Radar,
  ShieldCheck,
  Sparkles,
  Waypoints,
  Workflow
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const signalPills = ["SM3 Step Proof", "Groth16", "FastAPI × Next.js"];

const highlightMetrics = [
  {
    label: "消息容量",
    value: "247 B",
    description: "默认覆盖 1-4 个 SM3 block。"
  },
  {
    label: "验证方式",
    value: "全链校验",
    description: "摘要、状态链与公开信号一起核验。"
  },
  {
    label: "平台入口",
    value: "4 个工作区",
    description: "证明、验证、指标、实验一屏分发。"
  },
  {
    label: "结果形态",
    value: "Proof Bundle",
    description: "适合展示、归档和复验。"
  }
];

const workflowSteps = [
  {
    index: "01",
    title: "Message Intake",
    description: "录入文本、编码消息或业务摘要。"
  },
  {
    index: "02",
    title: "Block Chain",
    description: "padding 后按 block 构造状态链。"
  },
  {
    index: "03",
    title: "Step Proof",
    description: "逐步生成并汇总 proof bundle。"
  },
  {
    index: "04",
    title: "Final Verify",
    description: "统一查看摘要、验证结果与指标。"
  }
];

const capabilityCards = [
  {
    title: "隐私优先",
    body: "不暴露原文，只交付摘要与可验证结果。",
    icon: LockKeyhole
  },
  {
    title: "链路确定",
    body: "输入、拆块、证明、汇总、验证连成一条完整路径。",
    icon: Workflow
  },
  {
    title: "审查友好",
    body: "proof bundle、公开信号、耗时与大小集中展示。",
    icon: FileSearch
  }
];

const foundations = [
  {
    title: "电路内核",
    body: "SM3 压缩 step circuit 负责单步状态转移的可信证明。",
    icon: Blocks
  },
  {
    title: "服务编排",
    body: "FastAPI 统一处理哈希、输入构造、证明汇总与验证接口。",
    icon: DatabaseZap
  },
  {
    title: "观测面板",
    body: "指标面板和实验区负责性能观察、结果对比与导出。",
    icon: Radar
  }
];

const secondaryWorkspaces = [
  {
    title: "验证中心",
    description: "导入 proof bundle 与公开信号，快速确认整条证明链是否成立。",
    href: "/verify",
    icon: ShieldCheck,
    eyebrow: "Verify",
    className: "xl:col-span-2"
  },
  {
    title: "指标面板",
    description: "集中查看约束规模、artifact 状态与 proof 体积。",
    href: "/dashboard",
    icon: LayoutDashboard,
    eyebrow: "Observe",
    className: "xl:col-span-1"
  },
  {
    title: "实验分析",
    description: "对不同消息长度做批量测试，观察性能变化。",
    href: "/experiments",
    icon: FlaskConical,
    eyebrow: "Benchmark",
    className: "xl:col-span-1"
  }
];

const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.06
    }
  }
};

const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 28
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.72,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

const sectionViewport = { once: true, amount: 0.2 };

export default function HomePage() {
  return (
    <div className="page-frame space-y-5 py-6 sm:space-y-6 sm:py-8">
      <motion.section
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="product-shell relative overflow-hidden rounded-[2.4rem] border border-white/60 px-6 py-7 sm:px-8 sm:py-8 xl:px-10 xl:py-10 dark:border-white/10"
      >
        <div className="product-grid pointer-events-none absolute inset-0 opacity-70" />
        <motion.div
          className="pointer-events-none absolute -left-20 top-8 h-56 w-56 rounded-full bg-cyan-300/20 blur-3xl"
          animate={{ x: [0, 16, 0], y: [0, -14, 0], scale: [1, 1.06, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="pointer-events-none absolute right-6 top-0 h-64 w-64 rounded-full bg-amber-200/20 blur-3xl"
          animate={{ x: [0, -12, 0], y: [0, 18, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <motion.div variants={staggerContainer} className="space-y-7">
            <div className="flex flex-wrap gap-2">
              {signalPills.map((pill) => (
                <motion.span
                  key={pill}
                  variants={fadeUp}
                  className="inline-flex items-center rounded-full border border-primary/15 bg-white/70 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary dark:bg-white/5"
                >
                  {pill}
                </motion.span>
              ))}
            </div>

            <motion.div variants={fadeUp} className="space-y-5">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary/90">
                  SM3 Zero-Knowledge Gateway
                </p>
                <h1 className="max-w-4xl font-display text-5xl font-semibold leading-[1.04] tracking-[-0.025em] text-slate-950 sm:text-6xl lg:text-7xl xl:text-[5.25rem] dark:text-slate-50">
                  让链上数据可信，
                  <br />
                  而不是被看见。
                </h1>
              </div>
              <p className="max-w-2xl text-base leading-8 text-slate-700 sm:text-lg dark:text-slate-300">
                隐链卫士把 SM3 哈希链与零知识证明整合为完整展示界面。输入消息、生成证明、完成验证、观察指标，展示路径清晰，结果可直接演示。
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-14 px-8 text-base sm:text-lg">
                <Link href="/prove">
                  进入证明工作台
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="h-14 px-8 text-base sm:text-lg">
                <Link href="/verify">直接验证结果</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14 px-8 text-base sm:text-lg">
                <Link href="/experiments">查看实验分析</Link>
              </Button>
            </motion.div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {highlightMetrics.map((metric) => (
                <motion.div
                  key={metric.label}
                  variants={fadeUp}
                  whileHover={{ y: -8, scale: 1.01 }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  className="product-card rounded-[1.6rem] border border-white/70 p-4 dark:border-white/10"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/90">{metric.label}</p>
                  <p className="mt-3 font-heading text-2xl font-semibold text-slate-950 dark:text-slate-50">{metric.value}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{metric.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="relative">
            <Card className="product-card relative h-full overflow-hidden border-white/70 dark:border-white/10">
              <div className="hero-scanline pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent" />
              <CardHeader className="space-y-4 p-6 sm:p-7">
                <div className="flex items-center justify-between gap-4">
                  <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/15 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary dark:bg-white/5">
                    <Sparkles className="h-3.5 w-3.5" />
                    Proof Flow
                  </div>
                  <motion.span
                    animate={{ opacity: [0.72, 1, 0.72], scale: [1, 1.04, 1] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                    className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300"
                  >
                    Ready
                  </motion.span>
                </div>
                <div className="space-y-3">
                  <CardTitle className="text-3xl text-slate-950 sm:text-[2rem] dark:text-slate-50">
                    一屏总览整条可信路径
                  </CardTitle>
                  <CardDescription className="max-w-xl text-sm leading-7">
                    用最短的信息路径呈现核心流程、关键结果与操作入口。
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 px-6 pb-6 sm:px-7 sm:pb-7">
                {workflowSteps.map((step) => (
                  <motion.div
                    key={step.index}
                    variants={fadeUp}
                    whileHover={{ x: 6, y: -4 }}
                    transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                    className="group flex items-start gap-4 rounded-[1.45rem] border border-white/70 bg-white/72 p-4 dark:border-white/10 dark:bg-white/5"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-cyan-300 dark:bg-slate-900">
                      {step.index}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <p className="font-heading text-lg font-semibold text-slate-950 dark:text-slate-50">{step.title}</p>
                      <p className="text-sm leading-6 text-muted-foreground">{step.description}</p>
                    </div>
                  </motion.div>
                ))}

                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    ["链上存证", "Digest First"],
                    ["隐私核验", "Proof Bundle"],
                    ["审计复盘", "Metrics Ready"]
                  ].map(([label, value]) => (
                    <motion.div
                      key={label}
                      variants={fadeUp}
                      whileHover={{ y: -6 }}
                      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                      className="rounded-[1.35rem] border border-white/70 bg-white/72 p-4 dark:border-white/10 dark:bg-white/5"
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">{label}</p>
                      <p className="mt-2 font-heading text-xl font-semibold text-slate-950 dark:text-slate-50">{value}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={sectionViewport}
        variants={staggerContainer}
        className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]"
      >
        <motion.div variants={fadeUp}>
          <Card className="product-card overflow-hidden border-white/70 dark:border-white/10">
            <CardHeader className="space-y-4 p-6 sm:p-8">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/15 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary dark:bg-white/5">
                <Waypoints className="h-3.5 w-3.5" />
                Showcase
              </div>
              <div className="space-y-3">
                <CardTitle className="max-w-2xl text-3xl text-slate-950 sm:text-[2.2rem] dark:text-slate-50">
                  面向成果展示的可信证明平台。
                </CardTitle>
                <CardDescription className="max-w-2xl text-sm leading-7">
                  突出核心亮点、执行链路与可验证结果，适合用于项目汇报、答辩展示与方案演示。
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 px-6 pb-6 sm:grid-cols-3 sm:px-8 sm:pb-8">
              {[
                ["Private", "原文不出场，只展示摘要与证明结果。"],
                ["Verifiable", "验证中心直接复核 proof bundle 与公开信号。"],
                ["Observable", "指标面板与实验区补齐性能与审计视角。"]
              ].map(([label, body]) => (
                <motion.div
                  key={label}
                  variants={fadeUp}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-[1.4rem] border border-white/70 bg-white/72 p-4 dark:border-white/10 dark:bg-white/5"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">{label}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">{body}</p>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-3">
          {capabilityCards.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                variants={fadeUp}
                whileHover={{ y: -8, scale: 1.01 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              >
                <Card className="product-card h-full border-white/70 dark:border-white/10">
                  <CardHeader className="space-y-4 p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-2">
                      <CardTitle className="text-2xl text-slate-950 dark:text-slate-50">{item.title}</CardTitle>
                      <CardDescription className="leading-7">{item.body}</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={sectionViewport}
        variants={staggerContainer}
        className="space-y-5"
      >
        <motion.div variants={fadeUp} className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/90">Workspace</p>
            <h2 className="font-heading text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl dark:text-slate-50">
              四个入口，覆盖完整展示链路。
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              从证明生成到结果验证，再到指标与实验分析，演示路径清晰完整。
            </p>
          </div>
          <Button asChild variant="ghost" className="h-auto justify-start px-0 text-sm font-semibold text-primary hover:bg-transparent">
            <Link href="/prove">
              直接进入证明工作台
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>

        <div className="grid gap-4 xl:grid-cols-4 xl:grid-rows-[minmax(0,1fr)_minmax(0,1fr)]">
          <motion.div
            variants={fadeUp}
            whileHover={{ y: -10, scale: 1.01 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="xl:col-span-2 xl:row-span-2"
          >
            <Link href="/prove" className="block h-full">
              <Card className="product-card-strong group h-full overflow-hidden border-0 text-white">
                <CardHeader className="space-y-5 p-6 sm:p-8">
                  <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">
                    <Sparkles className="h-3.5 w-3.5" />
                    Primary Workspace
                  </div>
                  <div className="space-y-3">
                    <CardTitle className="text-4xl text-white sm:text-[3rem]">证明工作台</CardTitle>
                    <CardDescription className="max-w-2xl text-base leading-7 text-slate-300">
                      从消息输入直接进入 proof 生成与结果回显，是整个平台最适合用于现场展示的主入口。
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-5 px-6 pb-6 sm:px-8 sm:pb-8 lg:grid-cols-[1fr_0.86fr]">
                  <div className="grid gap-3">
                    <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300">Input</p>
                      <p className="mt-3 text-lg font-semibold text-white">文本、编码消息或业务字段摘要</p>
                    </div>
                    <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300">Pipeline</p>
                      <p className="mt-3 text-lg font-semibold text-white">SM3 哈希、拆块、step proof、proof bundle 一次完成</p>
                    </div>
                    <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300">Output</p>
                      <p className="mt-3 text-lg font-semibold text-white">摘要、公开信号、证明结果与耗时同屏展示</p>
                    </div>
                  </div>

                  <div className="space-y-3 rounded-[1.8rem] border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between rounded-[1.3rem] border border-white/10 bg-white/5 px-4 py-3">
                      <span className="text-xs uppercase tracking-[0.18em] text-slate-400">Digest</span>
                      <span className="font-medium text-white">SM3 Ready</span>
                    </div>
                    <div className="flex items-center justify-between rounded-[1.3rem] border border-white/10 bg-white/5 px-4 py-3">
                      <span className="text-xs uppercase tracking-[0.18em] text-slate-400">Blocks</span>
                      <span className="font-medium text-white">Auto Split</span>
                    </div>
                    <div className="flex items-center justify-between rounded-[1.3rem] border border-white/10 bg-white/5 px-4 py-3">
                      <span className="text-xs uppercase tracking-[0.18em] text-slate-400">Proof</span>
                      <span className="font-medium text-white">Bundle Output</span>
                    </div>
                    <div className="rounded-[1.3rem] border border-cyan-400/20 bg-cyan-400/10 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Entry</p>
                      <p className="mt-2 text-2xl font-semibold text-white">Input → Proof</p>
                    </div>
                    <div className="flex items-center gap-2 pt-1 text-sm font-semibold text-cyan-300">
                      打开工作台
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          {secondaryWorkspaces.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                variants={fadeUp}
                whileHover={{ y: -8, scale: 1.01 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                className={item.className}
              >
                <Link href={item.href} className="block h-full">
                  <Card className="product-card group h-full border-white/70 dark:border-white/10">
                    <CardHeader className="space-y-4 p-6">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary/80">{item.eyebrow}</p>
                      </div>
                      <div className="space-y-2">
                        <CardTitle className="text-2xl text-slate-950 dark:text-slate-50">{item.title}</CardTitle>
                        <CardDescription className="leading-7">{item.description}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between px-6 pb-6">
                      <span className="text-sm font-semibold text-primary">进入工作区</span>
                      <ArrowRight className="h-4 w-4 text-primary transition group-hover:translate-x-1" />
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={sectionViewport}
        variants={staggerContainer}
        className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr]"
      >
        <motion.div variants={fadeUp}>
          <Card className="product-card border-white/70 dark:border-white/10">
            <CardHeader className="space-y-4 p-6 sm:p-8">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/15 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary dark:bg-white/5">
                <Gauge className="h-3.5 w-3.5" />
                Foundation
              </div>
              <div className="space-y-3">
                <CardTitle className="text-3xl text-slate-950 sm:text-[2rem] dark:text-slate-50">
                  底层能力支撑完整展示链路。
                </CardTitle>
                <CardDescription className="max-w-2xl text-sm leading-7">
                  电路、服务与观测模块协同工作，让展示的不只是界面，而是可执行、可验证的完整流程。
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 px-6 pb-6 sm:grid-cols-3 sm:px-8 sm:pb-8">
              {foundations.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    variants={fadeUp}
                    whileHover={{ y: -6 }}
                    transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                    className="rounded-[1.5rem] border border-white/70 bg-white/72 p-4 dark:border-white/10 dark:bg-white/5"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 font-heading text-xl font-semibold text-slate-950 dark:text-slate-50">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.body}</p>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="product-card h-full border-white/70 dark:border-white/10">
            <CardHeader className="space-y-4 p-6 sm:p-8">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/15 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary dark:bg-white/5">
                <Sparkles className="h-3.5 w-3.5" />
                Demo
              </div>
              <div className="space-y-3">
                <CardTitle className="text-3xl text-slate-950 sm:text-[2rem] dark:text-slate-50">
                  现在开始演示完整证明流程。
                </CardTitle>
                <CardDescription className="text-sm leading-7">
                  展示整条链路时，从证明工作台开始；已有结果时，可直接进入验证中心。
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 px-6 pb-6 sm:px-8 sm:pb-8">
              <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                <Button asChild size="lg" className="h-14 w-full justify-between rounded-[1.2rem] px-5">
                  <Link href="/prove">
                    进入证明工作台
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                <Button asChild variant="secondary" size="lg" className="h-14 w-full justify-between rounded-[1.2rem] px-5">
                  <Link href="/verify">
                    打开验证中心
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.section>
    </div>
  );
}
