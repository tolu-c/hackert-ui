import type { AppColorTheme, AppTheme } from "./types";

// A theme colour key, or any CSS colour (`"tomato"`, `"#0ea5e9"`, `"oklch(…)"`).
export type AppColor = keyof AppColorTheme | (string & {});

export interface SchemeColors {
  readonly light: string;
  readonly dark: string;
}

export function isThemeColor(theme: AppTheme, color: string): color is keyof AppColorTheme {
  return Object.hasOwn(theme.colors, color);
}

// A CSS colour has no dark counterpart, so it is used in both schemes.
export function schemeColors(theme: AppTheme, color: AppColor): SchemeColors {
  if (isThemeColor(theme, color)) {
    return { light: theme.colors[color], dark: theme.dark.colors[color] };
  }
  return { light: color, dark: color };
}

// light-dark() resolves against the page's CSS color-scheme, so dark mode needs
// no React state and server-rendered markup is right on first paint.
export function byScheme(light: string, dark: string): string {
  return light === dark ? light : `light-dark(${light}, ${dark})`;
}
