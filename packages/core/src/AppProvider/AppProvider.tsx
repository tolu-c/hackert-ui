import {
  type Context,
  createContext,
  type ReactElement,
  type ReactNode,
  use,
  useMemo,
} from "react";
import { type AppTheme, type AppThemeOverride, DEFAULT_THEME, resolveTheme } from "../theme";

type ThemeContextValue = Readonly<AppTheme> | undefined;

// The context lives on globalThis so every copy of this module shares it. A
// second copy of core (nested install, bundled dependency) would otherwise
// create its own context and components would silently ignore AppProvider.
const THEME_CONTEXT_KEY = Symbol.for("@hackert-ui/core/ThemeContext");

interface ThemeContextEntry {
  readonly context: Context<ThemeContextValue>;
  readonly source: string;
}

const registry = globalThis as typeof globalThis & {
  [THEME_CONTEXT_KEY]?: ThemeContextEntry;
};

// HMR reloads the same file with a cache-busting query, so compare paths only.
function moduleSource(url: string): string {
  return url.split(/[?#]/)[0] ?? url;
}

const source = moduleSource(import.meta.url);
const existing = registry[THEME_CONTEXT_KEY];
if (existing && moduleSource(existing.source) !== source) {
  console.error(
    `@hackert-ui/core was loaded more than once (${existing.source} and ${source}). The copies share one theme context, but dedupe @hackert-ui/core in your package manager to avoid version drift.`,
  );
}

const entry = (registry[THEME_CONTEXT_KEY] ??= {
  context: createContext<ThemeContextValue>(undefined),
  source,
});
const ThemeContext = entry.context;

export function useSafeAppTheme(): Readonly<AppTheme> {
  return use(ThemeContext) ?? DEFAULT_THEME;
}

export function useAppTheme(): Readonly<AppTheme> {
  const theme = use(ThemeContext);

  if (theme === undefined) {
    throw new Error("@hackert-ui/core: useAppTheme must be used within AppProvider");
  }

  return theme;
}

export interface AppProviderProps {
  readonly children: ReactNode;
  // `| undefined` is required because the shared tsconfig enables
  // exactOptionalPropertyTypes; without it consumers cannot forward an
  // optional theme variable.
  readonly theme?: AppThemeOverride | undefined;
}

export function AppProvider({ children, theme }: AppProviderProps): ReactElement {
  const baseTheme = useSafeAppTheme();

  // Recomputes whenever `theme` changes identity, which an inline object
  // literal does on every render. Hoist the override to a constant, or pass
  // a memoized value, if a consumer needs a stable context value.
  const resolvedTheme = useMemo(() => resolveTheme(baseTheme, theme), [baseTheme, theme]);

  return <ThemeContext value={resolvedTheme}>{children}</ThemeContext>;
}

AppProvider.displayName = "@hackert-ui/core/AppProvider";
