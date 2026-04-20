import * as React from "react";

import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-2xl border border-input bg-background/70 px-4 py-2 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20",
        className
      )}
      {...props}
    />
  )
);

Input.displayName = "Input";
