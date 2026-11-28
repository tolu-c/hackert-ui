import { byScheme, type VariantColors } from "@hackert-ui/core";

export type ButtonVariant = "default" | "filled" | "outline" | "light" | "subtle" | "transparent";

interface SchemePair {
  readonly light: VariantColors;
  readonly dark: VariantColors;
}

export interface VariantVars {
  readonly "--hui-bg": string;
  readonly "--hui-fg": string;
  readonly "--hui-bd": string;
  readonly "--hui-bg-hover": string;
  readonly "--hui-fg-hover": string;
  readonly "--hui-bg-active": string;
  readonly "--hui-ring": string;
}

function pick(colors: SchemePair, key: keyof VariantColors): string {
  return byScheme(colors.light[key], colors.dark[key]);
}

// The neutral palette has no theme tokens; it matches the form controls' greys.
const NEUTRAL = {
  surface: "light-dark(#ffffff, #18181b)",
  text: "light-dark(#18181b, #f4f4f5)",
  border: "light-dark(#d4d4d8, #3f3f46)",
  hover: "light-dark(#f4f4f5, #27272a)",
  active: "light-dark(#e4e4e7, #3f3f46)",
} as const;

function textOnly(colors: SchemePair, hover: string, active: string): VariantVars {
  const text = pick(colors, "text");
  return {
    "--hui-bg": "transparent",
    "--hui-fg": text,
    "--hui-bd": "transparent",
    "--hui-bg-hover": hover,
    "--hui-fg-hover": text,
    "--hui-bg-active": active,
    "--hui-ring": pick(colors, "background"),
  };
}

// One entry per variant; adding a variant means adding one function here.
export const VARIANT_VARS: Readonly<Record<ButtonVariant, (colors: SchemePair) => VariantVars>> = {
  filled: (colors) => ({
    "--hui-bg": pick(colors, "background"),
    "--hui-fg": pick(colors, "foreground"),
    "--hui-bd": "transparent",
    "--hui-bg-hover": pick(colors, "hoverBackground"),
    "--hui-fg-hover": pick(colors, "hoverForeground"),
    "--hui-bg-active": pick(colors, "activeBackground"),
    "--hui-ring": pick(colors, "background"),
  }),
  light: (colors) => ({
    ...textOnly(colors, pick(colors, "lightHoverBackground"), pick(colors, "lightHoverBackground")),
    "--hui-bg": pick(colors, "lightBackground"),
  }),
  outline: (colors) => ({
    ...textOnly(colors, pick(colors, "lightBackground"), pick(colors, "lightHoverBackground")),
    "--hui-bd": pick(colors, "background"),
  }),
  subtle: (colors) =>
    textOnly(colors, pick(colors, "lightBackground"), pick(colors, "lightHoverBackground")),
  transparent: (colors) => textOnly(colors, "transparent", "transparent"),
  default: (colors) => ({
    "--hui-bg": NEUTRAL.surface,
    "--hui-fg": NEUTRAL.text,
    "--hui-bd": NEUTRAL.border,
    "--hui-bg-hover": NEUTRAL.hover,
    "--hui-fg-hover": NEUTRAL.text,
    "--hui-bg-active": NEUTRAL.active,
    "--hui-ring": pick(colors, "background"),
  }),
};
