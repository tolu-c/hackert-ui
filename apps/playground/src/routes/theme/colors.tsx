import { type AppColorTheme, useAppTheme, useVariantColors } from "@hackert-ui/core";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "#/components/PageHeader";

export const Route = createFileRoute("/theme/colors")({ component: ColorsPage });

function ColorsPage() {
  const theme = useAppTheme();
  const variants = Object.keys(theme.colors) as (keyof AppColorTheme)[];

  return (
    <div>
      <PageHeader
        title="Colors"
        packageName="@hackert-ui/core"
        description="Each theme colour is a single value. useVariantColors derives the readable text colour and the hover and pressed states from it, choosing white or near-black by WCAG contrast."
        importLine={'import { useVariantColors } from "@hackert-ui/core";'}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {variants.map((variant) => (
          <ColorCard key={variant} variant={variant} />
        ))}
      </div>
    </div>
  );
}

function ColorCard({ variant }: { readonly variant: keyof AppColorTheme }) {
  const colors = useVariantColors(variant);
  const chips = [
    ["text", colors.foreground],
    ["hover", colors.hoverBackground],
    ["hover text", colors.hoverForeground],
    ["active", colors.activeBackground],
  ] as const;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <div
        className="flex h-24 items-end justify-between p-4"
        style={{ backgroundColor: colors.background, color: colors.foreground }}
      >
        <span className="text-lg font-semibold">{variant}</span>
        <code className="text-xs">{colors.background}</code>
      </div>
      <dl className="grid grid-cols-2 gap-3 p-4 text-xs">
        {chips.map(([name, value]) => (
          <div key={name} className="flex items-center gap-2">
            <span
              className="size-4 shrink-0 rounded border border-slate-200"
              style={{ backgroundColor: value }}
            />
            <dt className="text-slate-500">{name}</dt>
            <dd className="ml-auto font-mono text-slate-700">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
