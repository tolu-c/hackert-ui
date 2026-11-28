import {
  type AppColor,
  type AppSpacingTheme,
  byScheme,
  schemeColors,
  useSafeAppTheme,
} from "@hackert-ui/core";
import { cn } from "@hackert-ui/utils";
import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from "react";
import { LOADER_CSS } from "./loader-styles";

export type LoaderType = "oval" | "bars" | "dots";
export type LoaderSize = keyof AppSpacingTheme;

export interface LoaderProps extends Omit<ComponentPropsWithoutRef<"span">, "color" | "children"> {
  readonly type?: LoaderType | undefined;
  // A size key, or a number of pixels.
  readonly size?: LoaderSize | number | undefined;
  // A theme colour key or any CSS colour. Defaults to the surrounding text colour.
  readonly color?: AppColor | undefined;
}

const SIZE_PX: Readonly<Record<LoaderSize, number>> = {
  xs: 18,
  sm: 22,
  md: 36,
  lg: 44,
  xl: 58,
  "2xl": 72,
};

// Each type is drawn by CSS from these parts; adding a type means adding one entry.
const PARTS: Readonly<Record<LoaderType, ReactNode>> = {
  oval: null,
  bars: (
    <>
      <span />
      <span />
      <span />
    </>
  ),
  dots: (
    <>
      <span />
      <span />
      <span />
    </>
  ),
};

export function Loader({
  type = "oval",
  size = "md",
  color,
  className,
  style,
  "aria-label": ariaLabel = "Loading",
  ...spanProps
}: LoaderProps) {
  const theme = useSafeAppTheme();
  const pixels = typeof size === "number" ? size : SIZE_PX[size];
  const colors = color === undefined ? undefined : schemeColors(theme, color);

  const vars = {
    "--hui-loader-size": `${pixels}px`,
    "--hui-loader-color": colors ? byScheme(colors.light, colors.dark) : "currentColor",
  } as CSSProperties;

  return (
    <>
      <style href="hui-loader" precedence="default">
        {LOADER_CSS}
      </style>
      <span
        role="status"
        aria-label={ariaLabel}
        {...spanProps}
        data-type={type}
        className={cn("hui-loader", className)}
        style={{ ...vars, ...style }}
      >
        {PARTS[type]}
      </span>
    </>
  );
}
