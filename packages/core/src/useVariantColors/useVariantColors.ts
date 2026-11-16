import { useSafeAppTheme } from "../AppProvider";
import { type AppColorTheme, deriveVariantColors, type VariantColors } from "../theme";

export function useVariantColors(variant: keyof AppColorTheme): VariantColors {
  const theme = useSafeAppTheme();
  return deriveVariantColors(variant, theme.colors[variant]);
}
