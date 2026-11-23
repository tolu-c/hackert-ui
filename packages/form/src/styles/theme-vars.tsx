import { useSafeAppTheme, useVariantColors } from "@hackert-ui/core";
import type { CSSProperties } from "react";

import { FORM_CSS } from "./form-styles";

// light-dark() resolves against the page's CSS color-scheme, so dark mode needs no React state.
function byScheme(light: string, dark: string): string {
  return light === dark ? light : `light-dark(${light}, ${dark})`;
}

export function useFormThemeVars(): CSSProperties {
  const theme = useSafeAppTheme();
  const primary = byScheme(
    useVariantColors("primary", "light").background,
    useVariantColors("primary", "dark").background,
  );
  const danger = byScheme(
    useVariantColors("danger", "light").background,
    useVariantColors("danger", "dark").background,
  );

  return {
    "--hui-primary": primary,
    "--hui-danger": danger,
    "--hui-radius": theme.radius.md,
    "--hui-font": theme.fontFamily,
  } as CSSProperties;
}

// React 19 hoists this into <head> once per href, however many fields render it.
export function FormStyles() {
  return (
    <style href="hui-form" precedence="default">
      {FORM_CSS}
    </style>
  );
}

export function cx(...parts: readonly (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}
