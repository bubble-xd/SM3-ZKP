import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function MetricCard({
  label,
  value,
  description
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <Card className="mesh-panel">
      <CardHeader className="pb-3">
        <CardDescription className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/85">{label}</CardDescription>
        <CardTitle className="text-3xl sm:text-[2rem]">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-7 text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
