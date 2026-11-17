import {
  type AppColorTheme,
  type AppRadiusTheme,
  type AppSpacingTheme,
  useSafeAppTheme,
  useVariantColors,
} from "@hackert-ui/core";
import { cn } from "@hackert-ui/utils";
import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from "react";
import { BUTTON_CSS } from "./button-styles";

export type ButtonVariant = keyof AppColorTheme;
export type ButtonSize = keyof AppSpacingTheme;
export type ButtonRadius = keyof AppRadiusTheme;

export interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  readonly children: ReactNode;
  readonly variant?: ButtonVariant | undefined;
  readonly size?: ButtonSize | undefined;
  readonly radius?: ButtonRadius | undefined;
}

// Vertical padding sits one spacing step below the horizontal padding.
const BLOCK_PADDING: Readonly<Record<ButtonSize, ButtonSize>> = {
  xs: "xs",
  sm: "xs",
  md: "sm",
  lg: "md",
  xl: "lg",
  "2xl": "xl",
};

// light-dark() resolves against the page's CSS color-scheme, so dark mode needs
// no React state and server-rendered markup is right on first paint.
function byScheme(light: string, dark: string): string {
  return light === dark ? light : `light-dark(${light}, ${dark})`;
}

export function Button({
  type = "button",
  variant = "primary",
  size = "md",
  radius = "md",
  className,
  style,
  children,
  ...buttonProps
}: ButtonProps) {
  const theme = useSafeAppTheme();
  const light = useVariantColors(variant, "light");
  const dark = useVariantColors(variant, "dark");

  const themed = {
    "--hui-bg": byScheme(light.background, dark.background),
    "--hui-fg": byScheme(light.foreground, dark.foreground),
    "--hui-bg-hover": byScheme(light.hoverBackground, dark.hoverBackground),
    "--hui-fg-hover": byScheme(light.hoverForeground, dark.hoverForeground),
    "--hui-bg-active": byScheme(light.activeBackground, dark.activeBackground),
    "--hui-radius": theme.radius[radius],
    "--hui-font": theme.fontFamily,
    "--hui-py": theme.spacing[BLOCK_PADDING[size]],
    "--hui-px": theme.spacing[size],
  } as CSSProperties;

  return (
    <>
      <style href="hui-button" precedence="default">
        {BUTTON_CSS}
      </style>
      <button
        {...buttonProps}
        type={type}
        className={cn("hui-button", className)}
        style={{ ...themed, ...style }}
      >
        {children}
      </button>
    </>
  );
}
