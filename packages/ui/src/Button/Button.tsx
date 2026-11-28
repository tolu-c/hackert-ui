import {
  type AppColor,
  type AppRadiusTheme,
  type AppSpacingTheme,
  useSafeAppTheme,
  useVariantColors,
} from "@hackert-ui/core";
import { cn } from "@hackert-ui/utils";
import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from "react";
import { Loader, type LoaderProps } from "../Loader";
import { BUTTON_CSS } from "./button-styles";
import { type ButtonVariant, VARIANT_VARS } from "./button-variants";

export type { ButtonVariant } from "./button-variants";
export type ButtonColor = AppColor;
export type ButtonSize = keyof AppSpacingTheme;
export type ButtonRadius = keyof AppRadiusTheme;
export type ButtonJustify = "center" | "space-between";

export interface ButtonProps extends Omit<ComponentPropsWithoutRef<"button">, "color"> {
  readonly children: ReactNode;
  // A theme colour key or any CSS colour.
  readonly color?: ButtonColor | undefined;
  readonly variant?: ButtonVariant | undefined;
  readonly size?: ButtonSize | undefined;
  readonly radius?: ButtonRadius | undefined;
  readonly loading?: boolean | undefined;
  readonly loaderProps?: LoaderProps | undefined;
  readonly leftSection?: ReactNode;
  readonly rightSection?: ReactNode;
  readonly justify?: ButtonJustify | undefined;
  readonly fullWidth?: boolean | undefined;
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

const FONT_SIZE: Readonly<Record<ButtonSize, number>> = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
};

function hasContent(node: ReactNode): boolean {
  return node !== undefined && node !== null && node !== false;
}

export function Button({
  type = "button",
  color = "primary",
  variant = "filled",
  size = "md",
  radius = "md",
  loading = false,
  loaderProps,
  leftSection,
  rightSection,
  justify = "center",
  fullWidth = false,
  disabled,
  className,
  style,
  children,
  ...buttonProps
}: ButtonProps) {
  const theme = useSafeAppTheme();
  const light = useVariantColors(color, "light");
  const dark = useVariantColors(color, "dark");
  const fontSize = FONT_SIZE[size];

  const themed = {
    ...VARIANT_VARS[variant]({ light, dark }),
    "--hui-radius": theme.radius[radius],
    "--hui-font": theme.fontFamily,
    "--hui-font-size": `${fontSize}px`,
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
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        data-variant={variant}
        data-justify={justify}
        data-loading={loading ? "" : undefined}
        data-full-width={fullWidth ? "" : undefined}
        className={cn("hui-button", className)}
        style={{ ...themed, ...style }}
      >
        <span className="hui-button-inner">
          {hasContent(leftSection) ? (
            <span className="hui-button-section" data-position="left">
              {leftSection}
            </span>
          ) : null}
          <span className="hui-button-label">{children}</span>
          {hasContent(rightSection) ? (
            <span className="hui-button-section" data-position="right">
              {rightSection}
            </span>
          ) : null}
        </span>
        {loading ? (
          // aria-busy already says it is working; the label stays the accessible name.
          <span className="hui-button-loader" aria-hidden="true">
            <Loader size={Math.round(fontSize * 1.15)} {...loaderProps} />
          </span>
        ) : null}
      </button>
    </>
  );
}
