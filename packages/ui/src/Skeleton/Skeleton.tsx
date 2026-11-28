import { type AppRadiusTheme, type AppTheme, useSafeAppTheme } from "@hackert-ui/core";
import { cn } from "@hackert-ui/utils";
import type { ComponentPropsWithoutRef, CSSProperties } from "react";
import { SKELETON_CSS } from "./skeleton-styles";

type CssLength = number | (string & {});

export interface SkeletonProps extends ComponentPropsWithoutRef<"div"> {
  // Any CSS length; numbers are pixels.
  readonly height?: CssLength | undefined;
  readonly width?: CssLength | undefined;
  // A radius key or any CSS length.
  readonly radius?: keyof AppRadiusTheme | CssLength | undefined;
  // Width, height and radius all take the value of `height`.
  readonly circle?: boolean | undefined;
  readonly animate?: boolean | undefined;
  // While true, the placeholder covers the children; set false once content has loaded.
  readonly visible?: boolean | undefined;
}

function toCss(value: CssLength | undefined): string | undefined {
  return typeof value === "number" ? `${value}px` : value;
}

function radiusValue(theme: AppTheme, radius: SkeletonProps["radius"]): string | undefined {
  if (typeof radius === "string" && Object.hasOwn(theme.radius, radius)) {
    return theme.radius[radius as keyof AppRadiusTheme];
  }
  return toCss(radius);
}

export function Skeleton({
  height,
  width,
  radius = "sm",
  circle = false,
  animate = true,
  visible = true,
  className,
  style,
  children,
  ...divProps
}: SkeletonProps) {
  const theme = useSafeAppTheme();
  const size = circle ? toCss(height) : undefined;

  const box: CSSProperties = {
    height: toCss(height),
    width: circle ? size : toCss(width),
    borderRadius: circle ? size : radiusValue(theme, radius),
  };

  // Children always render in the same place, so toggling `visible` never remounts them.
  return (
    <>
      <style href="hui-skeleton" precedence="default">
        {SKELETON_CSS}
      </style>
      <div
        {...divProps}
        className={cn("hui-skeleton", className)}
        style={{ ...box, ...style }}
        data-visible={visible ? "" : undefined}
        data-animate={animate ? "" : undefined}
        aria-busy={visible || undefined}
        inert={visible || undefined}
      >
        {children}
      </div>
    </>
  );
}
