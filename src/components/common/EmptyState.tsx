import { Button } from "@/components/ui/button";
import { QuickAddSheet } from "@/components/layout/QuickAddSheet";

export function EmptyState({
  title,
  description,
  actionLabel = "Quick Add",
}: {
  title: string;
  description: string;
  actionLabel?: string;
}) {
  return (
    <div className="rounded-lg border border-dashed bg-background p-8 text-center">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <div className="mt-4 flex items-center justify-center">
        <QuickAddSheet>
          <Button>{actionLabel}</Button>
        </QuickAddSheet>
      </div>
    </div>
  );
}
