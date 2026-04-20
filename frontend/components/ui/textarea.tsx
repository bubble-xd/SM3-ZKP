import * as React from "react";

import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[140px] w-full rounded-[1.25rem] border border-input bg-background/70 px-4 py-3 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20",
        className
      )}
      {...props}
    />
  )
);

Textarea.displayName = "Textarea";
