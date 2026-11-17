import { describe, expect, it } from "vite-plus/test";

import { DEFAULT_THEME } from "./defaultTheme";
import { resolveTheme } from "./resolve-theme";

describe("resolveTheme", () => {
  it("keeps the default dark palette when nothing is overridden", () => {
    expect(resolveTheme(DEFAULT_THEME, { radius: { md: "6px" } }).dark.colors).toEqual(
      DEFAULT_THEME.dark.colors,
    );
  });

  it("uses a light colour override in dark mode too when no dark colour is given", () => {
    const theme = resolveTheme(DEFAULT_THEME, { colors: { primary: "#0f766e" } });

    expect(theme.dark.colors.primary).toBe("#0f766e");
    expect(theme.dark.colors.danger).toBe(DEFAULT_THEME.dark.colors.danger);
  });

  it("prefers an explicit dark colour", () => {
    const theme = resolveTheme(DEFAULT_THEME, {
      colors: { primary: "#0f766e" },
      dark: { colors: { primary: "#2dd4bf" } },
    });

    expect(theme.colors.primary).toBe("#0f766e");
    expect(theme.dark.colors.primary).toBe("#2dd4bf");
  });
});
