import {
  type AppColor,
  type AppRadiusTheme,
  byScheme,
  useSafeAppTheme,
  useVariantColors,
} from "@hackert-ui/core";
import { cn } from "@hackert-ui/utils";
import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from "react";
import { CloseButton, type CloseButtonProps } from "../CloseButton";
import { Loader } from "../Loader";
import { NOTIFICATION_CSS } from "./notification-styles";

export interface NotificationProps extends Omit<
  ComponentPropsWithoutRef<"div">,
  "title" | "color"
> {
  readonly title?: ReactNode;
  // The message.
  readonly children?: ReactNode;
  // A theme colour key or any CSS colour, for the accent bar or icon.
  readonly color?: AppColor | undefined;
  readonly icon?: ReactNode;
  readonly loading?: boolean | undefined;
  readonly withCloseButton?: boolean | undefined;
  readonly onClose?: (() => void) | undefined;
  readonly closeButtonProps?: CloseButtonProps | undefined;
  readonly radius?: keyof AppRadiusTheme | undefined;
}

function hasContent(node: ReactNode): boolean {
  return node !== undefined && node !== null && node !== false;
}

export function Notification({
  title,
  children,
  color = "primary",
  icon,
  loading = false,
  withCloseButton = true,
  onClose,
  closeButtonProps,
  radius = "md",
  className,
  style,
  ...divProps
}: NotificationProps) {
  const theme = useSafeAppTheme();
  const light = useVariantColors(color, "light");
  const dark = useVariantColors(color, "dark");
  const withIcon = loading || hasContent(icon);

  const vars = {
    "--hui-accent": byScheme(light.background, dark.background),
    "--hui-accent-text": byScheme(light.text, dark.text),
    "--hui-accent-tint": byScheme(light.lightBackground, dark.lightBackground),
    "--hui-radius": theme.radius[radius],
    "--hui-font": theme.fontFamily,
  } as CSSProperties;

  return (
    <>
      <style href="hui-notification" precedence="default">
        {NOTIFICATION_CSS}
      </style>
      <div
        {...divProps}
        className={cn("hui-notification", className)}
        style={{ ...vars, ...style }}
        data-with-icon={withIcon ? "" : undefined}
      >
        {withIcon ? (
          <span className="hui-notification-icon" data-loading={loading ? "" : undefined}>
            {loading ? <Loader size={18} aria-label="Loading" /> : icon}
          </span>
        ) : null}
        <div className="hui-notification-body">
          {hasContent(title) ? <p className="hui-notification-title">{title}</p> : null}
          {hasContent(children) ? <div className="hui-notification-message">{children}</div> : null}
        </div>
        {withCloseButton ? (
          <CloseButton
            size="sm"
            aria-label="Close notification"
            {...closeButtonProps}
            onClick={(event) => {
              closeButtonProps?.onClick?.(event);
              onClose?.();
            }}
          />
        ) : null}
      </div>
    </>
  );
}
