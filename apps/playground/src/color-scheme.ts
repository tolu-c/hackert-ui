import type { ColorScheme } from "@hackert-ui/core";
import { useSyncExternalStore } from "react";

export const PREFERENCES = ["system", "light", "dark"] as const;
export type Preference = (typeof PREFERENCES)[number];

// index.html reads the same key before first paint; keep them in sync.
const STORAGE_KEY = "hui-playground-color-scheme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

export function readPreference(stored: string | null): Preference {
  return PREFERENCES.find((preference) => preference === stored) ?? "system";
}

export function resolveScheme(preference: Preference, systemDark: boolean): ColorScheme {
  if (preference === "system") {
    return systemDark ? "dark" : "light";
  }
  return preference;
}

function loadPreference(): Preference {
  try {
    return readPreference(localStorage.getItem(STORAGE_KEY));
  } catch {
    return "system";
  }
}

const listeners = new Set<() => void>();
let preference = loadPreference();

function systemDark() {
  return matchMedia(DARK_QUERY).matches;
}

function apply() {
  const scheme = resolveScheme(preference, systemDark());
  const root = document.documentElement;
  // Switch instantly: per-element colour transitions would fade the page in
  // patches rather than as one change.
  const freeze = document.createElement("style");
  freeze.textContent = "*,*::before,*::after{transition:none!important}";
  document.head.append(freeze);
  root.classList.toggle("dark", scheme === "dark");
  root.style.colorScheme = scheme;
  // Force a style recalculation while transitions are frozen.
  void getComputedStyle(root).colorScheme;
  freeze.remove();
}

function notify() {
  apply();
  for (const listener of listeners) {
    listener();
  }
}

export function setPreference(next: Preference) {
  preference = next;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Storage can be unavailable (private mode); the choice still applies now.
  }
  notify();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const query = matchMedia(DARK_QUERY);
  query.addEventListener("change", notify);
  return () => {
    listeners.delete(listener);
    query.removeEventListener("change", notify);
  };
}

export function usePreference(): Preference {
  return useSyncExternalStore(subscribe, () => preference);
}

export function useColorScheme(): ColorScheme {
  return useSyncExternalStore(subscribe, () => resolveScheme(preference, systemDark()));
}
