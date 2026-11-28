import type { AppColor } from "@hackert-ui/core";
import { type CSSProperties, type ReactNode, useSyncExternalStore } from "react";

export interface NotificationData {
  // Reuse an id to update a notification in place.
  readonly id?: string | undefined;
  readonly title?: ReactNode;
  readonly message?: ReactNode;
  // A theme colour key or any CSS colour, for the accent bar or icon.
  readonly color?: AppColor | undefined;
  readonly icon?: ReactNode;
  // Shows a spinner, and holds off auto-close until loading ends.
  readonly loading?: boolean | undefined;
  // Milliseconds before it closes itself, or false to stay. Defaults to 4000.
  readonly autoClose?: number | false | undefined;
  readonly withCloseButton?: boolean | undefined;
  readonly onClose?: ((id: string) => void) | undefined;
  readonly className?: string | undefined;
  readonly style?: CSSProperties | undefined;
}

export interface NotificationEntry extends NotificationData {
  readonly id: string;
  // Unique per entry, unlike a reusable id; the React key.
  readonly key: number;
  // Set while the exit transition plays, before the entry is removed.
  readonly leaving: boolean;
  // Bumped on every update, so the auto-close timer can restart.
  readonly version: number;
}

type Listener = () => void;

interface Store {
  entries: readonly NotificationEntry[];
  readonly listeners: Set<Listener>;
  nextKey: number;
}

// Kept on globalThis so every copy of this module shares one list; a duplicate
// install would otherwise show notifications in one viewport and not another.
const STORE_KEY = Symbol.for("@hackert-ui/ui/notifications");
const registry = globalThis as typeof globalThis & { [STORE_KEY]?: Store };
const store = (registry[STORE_KEY] ??= { entries: [], listeners: new Set(), nextKey: 0 });

export const NOTIFICATION_EXIT_MS = 200;
const EMPTY: readonly NotificationEntry[] = [];

function setEntries(entries: readonly NotificationEntry[]) {
  store.entries = entries;
  for (const listener of store.listeners) listener();
}

function update(id: string, data: Omit<NotificationData, "id">) {
  setEntries(
    store.entries.map((entry) =>
      entry.id === id && !entry.leaving
        ? { ...entry, ...data, id, version: entry.version + 1 }
        : entry,
    ),
  );
}

function hide(id: string) {
  const entry = store.entries.find((candidate) => candidate.id === id && !candidate.leaving);
  if (!entry) return;

  setEntries(
    store.entries.map((candidate) =>
      candidate === entry ? { ...candidate, leaving: true } : candidate,
    ),
  );
  entry.onClose?.(id);
  // Only the leaving entry goes: the id may have been shown again meanwhile.
  setTimeout(() => {
    setEntries(store.entries.filter((candidate) => !(candidate.id === id && candidate.leaving)));
  }, NOTIFICATION_EXIT_MS);
}

function show(data: NotificationData): string {
  const key = ++store.nextKey;
  const id = data.id ?? `hui-notification-${key}`;
  if (store.entries.some((entry) => entry.id === id && !entry.leaving)) {
    update(id, data);
  } else {
    setEntries([...store.entries, { ...data, id, key, leaving: false, version: 0 }]);
  }
  return id;
}

function clean() {
  for (const entry of store.entries) hide(entry.id);
}

export const notifications = { show, update, hide, clean } as const;

export type NotificationsApi = typeof notifications;

function subscribe(listener: Listener) {
  store.listeners.add(listener);
  return () => store.listeners.delete(listener);
}

// Every notification, in the order shown, including ones waiting beyond a limit.
export function useNotifications(): readonly NotificationEntry[] {
  return useSyncExternalStore(
    subscribe,
    () => store.entries,
    () => EMPTY,
  );
}

export function useNotify(): NotificationsApi {
  return notifications;
}
