import { type AppSpacingTheme, byScheme, useSafeAppTheme } from "@hackert-ui/core";
import { cn } from "@hackert-ui/utils";
import type { ComponentPropsWithoutRef, CSSProperties } from "react";
import { CLOSE_BUTTON_CSS } from "./close-button-styles";

export type CloseButtonSize = keyof AppSpacingTheme;

export interface CloseButtonProps extends ComponentPropsWithoutRef<"button"> {
  readonly size?: CloseButtonSize | undefined;
}

const SIZE_PX: Readonly<Record<CloseButtonSize, number>> = {
  xs: 20,
  sm: 24,
  md: 28,
  lg: 34,
  xl: 40,
  "2xl": 48,
};

const X_ICON = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export function CloseButton({
  type = "button",
  size = "md",
  "aria-label": ariaLabel = "Close",
  className,
  style,
  children,
  ...buttonProps
}: CloseButtonProps) {
  const theme = useSafeAppTheme();

  const vars = {
    "--hui-close-size": `${SIZE_PX[size]}px`,
    "--hui-radius": theme.radius.sm,
    "--hui-ring": byScheme(theme.colors.primary, theme.dark.colors.primary),
  } as CSSProperties;

  return (
    <>
      <style href="hui-close-button" precedence="default">
        {CLOSE_BUTTON_CSS}
      </style>
      <button
        {...buttonProps}
        type={type}
        aria-label={ariaLabel}
        className={cn("hui-close-button", className)}
        style={{ ...vars, ...style }}
      >
        {children ?? X_ICON}
      </button>
    </>
  );
}
