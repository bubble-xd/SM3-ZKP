import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ProcessSidebar({
  title,
  description,
  steps
}: {
  title: string;
  description: string;
  steps: Array<{ title: string; body: string }>;
}) {
  return (
    <Card className="h-full overflow-hidden">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="relative space-y-5">
        <div className="absolute left-[1.02rem] top-1 bottom-2 w-px bg-gradient-to-b from-primary/40 via-primary/15 to-transparent" />
        {steps.map((step, index) => (
          <div key={step.title} className="relative flex gap-4">
            <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/18 bg-primary/12 text-sm font-semibold text-primary">
              {index + 1}
            </div>
            <div className="space-y-1">
              <p className="font-medium">{step.title}</p>
              <p className="text-sm leading-6 text-muted-foreground">{step.body}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
