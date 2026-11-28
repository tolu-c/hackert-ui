import { describe, expect, it } from "vite-plus/test";

import { DEFAULT_THEME } from "./defaultTheme";
import { byScheme, isThemeColor, schemeColors } from "./theme-color";

describe("isThemeColor", () => {
  it("recognises the theme's colour keys", () => {
    expect(isThemeColor(DEFAULT_THEME, "danger")).toBe(true);
  });

  it("rejects CSS colours and inherited object keys", () => {
    expect(isThemeColor(DEFAULT_THEME, "#ff0000")).toBe(false);
    expect(isThemeColor(DEFAULT_THEME, "constructor")).toBe(false);
  });
});

describe("schemeColors", () => {
  it("reads a theme key from the light and dark palettes", () => {
    expect(schemeColors(DEFAULT_THEME, "primary")).toEqual({
      light: DEFAULT_THEME.colors.primary,
      dark: DEFAULT_THEME.dark.colors.primary,
    });
  });

  it("uses a CSS colour for both schemes", () => {
    expect(schemeColors(DEFAULT_THEME, "tomato")).toEqual({ light: "tomato", dark: "tomato" });
  });
});

describe("byScheme", () => {
  it("collapses equal colours", () => {
    expect(byScheme("#fff", "#fff")).toBe("#fff");
  });

  it("pairs different colours with light-dark()", () => {
    expect(byScheme("#fff", "#000")).toBe("light-dark(#fff, #000)");
  });
});
