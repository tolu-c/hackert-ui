import { useAppTheme } from "@hackert-ui/core";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/theme/radius")({ component: RadiusPage });

function RadiusPage() {
  const theme = useAppTheme();

  return (
    <div>
      <PageHeader
        title="Radius"
        packageName="@hackert-ui/core"
        description="The corner radius scale, used by Button's radius prop."
      />
      <div className="flex flex-wrap gap-6">
        {Object.entries(theme.radius).map(([name, value]) => (
          <div key={name} className="text-center">
            <div className="size-16 border-2 border-fg-soft" style={{ borderRadius: value }} />
            <p className="mt-2 text-xs text-fg-muted">
              {name} · {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
