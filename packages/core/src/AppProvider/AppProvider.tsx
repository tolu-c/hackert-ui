import {
  createContext,
  type ReactElement,
  type ReactNode,
  use,
  useMemo,
} from "react";
import {
  type AppTheme,
  type AppThemeOverride,
  DEFAULT_THEME,
  resolveTheme,
} from "../theme";

const ThemeContext = createContext<Readonly<AppTheme> | undefined>(undefined);

export const useSafeAppTheme = () => use(ThemeContext) ?? DEFAULT_THEME;

export function useAppTheme(): Readonly<AppTheme> {
  const theme = use(ThemeContext);

  if (theme === undefined) {
    throw new Error(
      "@hackert-ui/core: useAppTheme must be used within AppProvider",
    );
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

export function AppProvider({
  children,
  theme,
}: AppProviderProps): ReactElement {
  const baseTheme = useSafeAppTheme();

  // Recomputes whenever `theme` changes identity, which an inline object
  // literal does on every render. Hoist the override to a constant, or pass
  // a memoized value, if a consumer needs a stable context value.
  const resolvedTheme = useMemo(
    () => resolveTheme(baseTheme, theme),
    [baseTheme, theme],
  );

  return <ThemeContext value={resolvedTheme}>{children}</ThemeContext>;
}

AppProvider.displayName = "@hackert-ui/core/AppProvider";
