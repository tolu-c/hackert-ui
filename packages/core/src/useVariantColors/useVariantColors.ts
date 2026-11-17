import { useSafeAppTheme } from "../AppProvider";
import {
  type AppColorTheme,
  type ColorScheme,
  deriveVariantColors,
  type VariantColors,
} from "../theme";

export function useVariantColors(
  variant: keyof AppColorTheme,
  scheme: ColorScheme = "light",
): VariantColors {
  const theme = useSafeAppTheme();
  const colors = scheme === "dark" ? theme.dark.colors : theme.colors;
  return deriveVariantColors(variant, colors[variant], scheme);
}
