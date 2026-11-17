import { useAppTheme } from "@hackert-ui/core";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/theme/spacing")({ component: SpacingPage });

function SpacingPage() {
  const theme = useAppTheme();

  return (
    <div>
      <PageHeader
        title="Spacing"
        packageName="@hackert-ui/core"
        description="The spacing scale. Button padding is drawn from it: horizontal at the size, vertical one step smaller."
      />
      <div className="space-y-3">
        {Object.entries(theme.spacing).map(([name, value]) => (
          <div key={name} className="flex items-center gap-4">
            <code className="w-12 text-xs text-fg-muted">{name}</code>
            <div className="h-4 rounded-sm bg-fg-soft" style={{ width: value }} />
            <span className="text-xs text-fg-muted">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
