import { AlertTriangle, CheckCircle2, LoaderCircle, PauseCircle, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export type FlowStatus = "idle" | "hashing" | "proving" | "verifying" | "done" | "failed";

const statusMap = {
  idle: {
    label: "Idle",
    icon: PauseCircle,
    variant: "neutral" as const
  },
  hashing: {
    label: "Hashing",
    icon: LoaderCircle,
    variant: "info" as const
  },
  proving: {
    label: "Proving",
    icon: LoaderCircle,
    variant: "warning" as const
  },
  verifying: {
    label: "Verifying",
    icon: LoaderCircle,
    variant: "warning" as const
  },
  done: {
    label: "Done",
    icon: CheckCircle2,
    variant: "success" as const
  },
  failed: {
    label: "Failed",
    icon: ShieldAlert,
    variant: "danger" as const
  }
};

export function StatusPill({ status }: { status: FlowStatus }) {
  const config = statusMap[status];
  const Icon = config.icon;
  const spinning = status === "hashing" || status === "proving" || status === "verifying";
  return (
    <Badge variant={config.variant}>
      <Icon className={spinning ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
      {config.label}
    </Badge>
  );
}

export function ErrorBadge({ message }: { message: string }) {
  return (
    <Badge variant="danger">
      <AlertTriangle className="h-3.5 w-3.5" />
      {message}
    </Badge>
  );
}
