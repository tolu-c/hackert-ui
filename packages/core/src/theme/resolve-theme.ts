import type { AppTheme, AppThemeOverride } from "./types";

export function resolveTheme(
  baseTheme: Readonly<AppTheme>,
  override?: AppThemeOverride | undefined,
): Readonly<AppTheme> {
  if (!override) {
    return baseTheme;
  }

  return Object.freeze({
    colors: Object.freeze({ ...baseTheme.colors, ...override.colors }),
    radius: Object.freeze({ ...baseTheme.radius, ...override.radius }),
    spacing: Object.freeze({ ...baseTheme.spacing, ...override.spacing }),
    fontFamily: override.fontFamily ?? baseTheme.fontFamily,
  });
}
