import { useSafeAppTheme } from "../AppProvider";
import {
  type AppColor,
  type ColorScheme,
  deriveVariantColors,
  schemeColors,
  type VariantColors,
} from "../theme";

// `color` is a theme key, read from the scheme's palette, or any CSS colour.
export function useVariantColors(color: AppColor, scheme: ColorScheme = "light"): VariantColors {
  const theme = useSafeAppTheme();
  return deriveVariantColors(color, schemeColors(theme, color)[scheme], scheme);
}
