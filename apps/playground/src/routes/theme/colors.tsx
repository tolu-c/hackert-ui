import { type AppColorTheme, useAppTheme, useVariantColors } from "@hackert-ui/core";
import { createFileRoute } from "@tanstack/react-router";
import { useColorScheme } from "@/color-scheme";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/theme/colors")({ component: ColorsPage });

function ColorsPage() {
  const theme = useAppTheme();
  const variants = Object.keys(theme.colors) as (keyof AppColorTheme)[];

  return (
    <div>
      <PageHeader
        title="Colors"
        packageName="@hackert-ui/core"
        description="Each theme colour is a single value. useVariantColors derives the readable text colour and the hover and pressed states from it, choosing white or near-black by WCAG contrast. Dark mode has its own palette, and hover lightens instead of darkens; switch the theme in the header to compare."
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
  const colors = useVariantColors(variant, useColorScheme());
  const chips = [
    ["text", colors.foreground],
    ["hover", colors.hoverBackground],
    ["hover text", colors.hoverForeground],
    ["active", colors.activeBackground],
  ] as const;

  return (
    <div className="overflow-hidden rounded-xl border border-line">
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
              className="size-4 shrink-0 rounded border border-line"
              style={{ backgroundColor: value }}
            />
            <dt className="text-fg-muted">{name}</dt>
            <dd className="ml-auto font-mono text-fg-soft">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
