import { useAppTheme } from "@hackert-ui/core";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "#/components/PageHeader";

export const Route = createFileRoute("/theme")({ component: ThemeRoute });

function ThemeRoute() {
  const theme = useAppTheme();

  return (
    <div>
      <PageHeader
        title="Theme"
        packageName="@hackert-ui/core"
        description="AppProvider resolves an override against the default theme and shares the result through context. Nested providers inherit from the nearest parent."
      />

      <h2 className="text-lg font-semibold tracking-tight">Colors</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {Object.entries(theme.colors).map(([name, value]) => (
          <div key={name} className="rounded-lg border border-slate-200 p-3">
            <div
              className="h-12 w-full rounded"
              style={{ backgroundColor: value }}
            />
            <p className="mt-2 text-xs font-medium">{name}</p>
            <p className="text-xs text-slate-500">{value}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-lg font-semibold tracking-tight">Spacing</h2>
      <div className="mt-4 space-y-2">
        {Object.entries(theme.spacing).map(([name, value]) => (
          <div key={name} className="flex items-center gap-4">
            <code className="w-12 text-xs text-slate-500">{name}</code>
            <div className="h-4 bg-slate-800" style={{ width: value }} />
            <span className="text-xs text-slate-500">{value}</span>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-lg font-semibold tracking-tight">Radius</h2>
      <div className="mt-4 flex flex-wrap gap-4">
        {Object.entries(theme.radius).map(([name, value]) => (
          <div key={name} className="text-center">
            <div
              className="h-16 w-16 border-2 border-slate-800"
              style={{ borderRadius: value }}
            />
            <p className="mt-2 text-xs text-slate-500">
              {name} · {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
