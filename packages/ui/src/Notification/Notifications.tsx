import { cn } from "@hackert-ui/utils";
import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { Notification } from "./Notification";
import { NOTIFICATION_CSS } from "./notification-styles";
import { type NotificationEntry, notifications, useNotifications } from "./store";

export type NotificationsPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export interface NotificationsProps extends Omit<ComponentPropsWithoutRef<"section">, "children"> {
  readonly position?: NotificationsPosition | undefined;
  // How many show at once; the rest wait their turn.
  readonly limit?: number | undefined;
  readonly zIndex?: number | undefined;
}

const DEFAULT_AUTO_CLOSE = 4000;

function noSubscription() {
  return () => {};
}

// False during SSR and hydration, true after: the portal needs document.body.
function useIsClient() {
  return useSyncExternalStore(
    noSubscription,
    () => true,
    () => false,
  );
}

function subscribeVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

function usePageHidden() {
  return useSyncExternalStore(
    subscribeVisibility,
    () => document.visibilityState === "hidden",
    () => false,
  );
}

// Counts down while the stack is not paused, keeping the time left across pauses.
// An update (a new version) starts the countdown again from the full duration.
function useAutoClose(entry: NotificationEntry, paused: boolean) {
  const duration = entry.autoClose ?? DEFAULT_AUTO_CLOSE;
  const remaining = useRef(duration === false ? 0 : duration);
  const { id, version, leaving, loading } = entry;

  useEffect(() => {
    remaining.current = duration === false ? 0 : duration;
  }, [version, duration]);

  useEffect(() => {
    if (duration === false || paused || leaving || loading) return;
    const startedAt = Date.now();
    const timer = setTimeout(() => notifications.hide(id), remaining.current);
    return () => {
      clearTimeout(timer);
      remaining.current -= Date.now() - startedAt;
    };
  }, [id, version, duration, paused, leaving, loading]);
}

function NotificationSlot({
  entry,
  paused,
}: {
  readonly entry: NotificationEntry;
  readonly paused: boolean;
}) {
  useAutoClose(entry, paused);

  return (
    <li className="hui-notification-slot" data-leaving={entry.leaving ? "" : undefined}>
      <div className="hui-notification-clip">
        <Notification
          title={entry.title}
          color={entry.color}
          icon={entry.icon}
          loading={entry.loading}
          withCloseButton={entry.withCloseButton}
          className={entry.className}
          style={entry.style}
          onClose={() => notifications.hide(entry.id)}
        >
          {entry.message}
        </Notification>
      </div>
    </li>
  );
}

// Mount once, anywhere; notifications.show() from anywhere appears here.
export function Notifications({
  position = "bottom-right",
  limit = 5,
  zIndex,
  className,
  style,
  ...sectionProps
}: NotificationsProps) {
  const entries = useNotifications();
  const isClient = useIsClient();
  const pageHidden = usePageHidden();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const paused = hovered || focused || pageHidden;
  const listRef = useRef<HTMLOListElement>(null);

  // Blur never fires when the focused notification unmounts.
  useEffect(() => {
    if (focused && !listRef.current?.contains(document.activeElement)) setFocused(false);
  }, [entries, focused]);

  if (!isClient) return null;

  const vars = (zIndex === undefined ? {} : { "--hui-notifications-z": zIndex }) as CSSProperties;

  return createPortal(
    <>
      <style href="hui-notification" precedence="default">
        {NOTIFICATION_CSS}
      </style>
      <section
        aria-label="Notifications"
        {...sectionProps}
        className={cn("hui-notifications", className)}
        style={{ ...vars, ...style }}
        data-position={position}
      >
        <ol
          ref={listRef}
          className="hui-notifications-list"
          aria-live="polite"
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          onFocus={() => setFocused(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
          }}
        >
          {entries.slice(0, limit).map((entry) => (
            <NotificationSlot key={entry.key} entry={entry} paused={paused} />
          ))}
        </ol>
      </section>
    </>,
    document.body,
  );
}
