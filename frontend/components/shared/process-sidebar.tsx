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
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {steps.map((step, index) => (
          <div key={step.title} className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
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

