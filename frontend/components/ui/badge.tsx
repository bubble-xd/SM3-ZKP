import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur",
  {
    variants: {
      variant: {
        neutral: "border-border bg-secondary/70 text-foreground",
        success: "border-emerald-500/26 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
        warning: "border-amber-500/28 bg-amber-500/12 text-amber-700 dark:text-amber-300",
        danger: "border-rose-500/28 bg-rose-500/12 text-rose-700 dark:text-rose-300",
        info: "border-cyan-500/28 bg-cyan-500/12 text-cyan-700 dark:text-cyan-300"
      }
    },
    defaultVariants: {
      variant: "neutral"
    }
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
