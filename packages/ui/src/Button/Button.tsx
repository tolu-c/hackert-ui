import {
  type AppColorTheme,
  type AppRadiusTheme,
  type AppSpacingTheme,
  useSafeAppTheme,
} from "@hackert-ui/core";
import { cn } from "@hackert-ui/utils";
import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from "react";

export type ButtonVariant = keyof AppColorTheme;
export type ButtonSize = keyof AppSpacingTheme;
export type ButtonRadius = keyof AppRadiusTheme;

export interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  readonly children: ReactNode;
  readonly variant?: ButtonVariant | undefined;
  readonly size?: ButtonSize | undefined;
  readonly radius?: ButtonRadius | undefined;
  readonly cursorPointer?: boolean | undefined;
}

export function Button({
  type = "button",
  variant = "primary",
  size = "md",
  radius = "md",
  className,
  style,
  children,
  cursorPointer = true,
  ...buttonProps
}: ButtonProps) {
  const theme = useSafeAppTheme();

  const themed: CSSProperties = {
    backgroundColor: theme.colors[variant],
    borderRadius: theme.radius[radius],
    fontFamily: theme.fontFamily,
    border: "none",
  };

  return (
    <button
      {...buttonProps}
      type={type}
      className={cn(
        "my-button",
        { "cursor-pointer": cursorPointer },
        className,
      )}
      style={{ ...themed, ...style }}
    >
      {children}
    </button>
  );
}
