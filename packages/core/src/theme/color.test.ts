import { describe, expect, it } from "vite-plus/test";

import { deriveVariantColors, parseColor } from "./color";
import { DEFAULT_THEME } from "./defaultTheme";

const WHITE = "#ffffff";
const DARK = "#0a0a0a";

function channelSum(hex: string) {
  const rgb = parseColor(hex);
  if (!rgb) throw new Error(`expected ${hex} to parse`);
  return rgb.r + rgb.g + rgb.b;
}

describe("parseColor", () => {
  it.each([
    "#f00",
    "#f00f",
    "#ff0000",
    "#FF0000FF",
    "rgb(255, 0, 0)",
    "rgb(255 0 0)",
    "rgba(255, 0, 0, 1)",
    "rgb(100% 0% 0% / 100%)",
    "oklch(62.8% 0.2577 29.23)",
    "oklch(0.628 0.2577 29.23deg / 1)",
  ])("reads %s as red", (input) => {
    const rgb = parseColor(input);

    expect(rgb?.r).toBeCloseTo(1, 2);
    expect(rgb?.g).toBeCloseTo(0, 2);
    expect(rgb?.b).toBeCloseTo(0, 2);
  });

  it("returns undefined for formats it does not support", () => {
    expect(parseColor("red")).toBeUndefined();
    expect(parseColor("hsl(0 100% 50%)")).toBeUndefined();
    expect(parseColor("#ff000")).toBeUndefined();
  });
});

describe("deriveVariantColors", () => {
  it("keeps the theme colour as the background", () => {
    expect(deriveVariantColors("primary", "oklch(0.5 0.2 260)").background).toBe(
      "oklch(0.5 0.2 260)",
    );
  });

  it("puts light text on dark backgrounds and dark text on light ones", () => {
    expect(deriveVariantColors("primary", DEFAULT_THEME.colors.primary).foreground).toBe(WHITE);
    expect(deriveVariantColors("danger", DEFAULT_THEME.colors.danger).foreground).toBe(WHITE);
    expect(deriveVariantColors("warning", DEFAULT_THEME.colors.warning).foreground).toBe(DARK);
  });

  it("darkens mid-tone backgrounds on hover and further on press", () => {
    const colors = deriveVariantColors("primary", DEFAULT_THEME.colors.primary);
    const base = channelSum(DEFAULT_THEME.colors.primary);

    expect(channelSum(colors.hoverBackground)).toBeLessThan(base);
    expect(channelSum(colors.activeBackground)).toBeLessThan(channelSum(colors.hoverBackground));
  });

  it("lightens near-black backgrounds on hover so the change is visible", () => {
    const colors = deriveVariantColors("secondary", "#111111");

    expect(channelSum(colors.hoverBackground)).toBeGreaterThan(channelSum("#111111"));
    expect(colors.hoverForeground).toBe(WHITE);
  });

  it("lightens on hover and further on press in dark mode", () => {
    const color = DEFAULT_THEME.dark.colors.primary;
    const colors = deriveVariantColors("primary", color, "dark");

    expect(channelSum(colors.hoverBackground)).toBeGreaterThan(channelSum(color));
    expect(channelSum(colors.activeBackground)).toBeGreaterThan(channelSum(colors.hoverBackground));
  });

  it("darkens near-white backgrounds on hover in dark mode so the change is visible", () => {
    const colors = deriveVariantColors("secondary", "#f5f5f5", "dark");
    expect(channelSum(colors.hoverBackground)).toBeLessThan(channelSum("#f5f5f5"));
  });

  it("keeps light and dark derivations of the same colour apart", () => {
    const light = deriveVariantColors("primary", "#2563eb", "light");
    const dark = deriveVariantColors("primary", "#2563eb", "dark");
    expect(light.hoverBackground).not.toBe(dark.hoverBackground);
  });

  it("names the variant and value when the format is unsupported", () => {
    expect(() => deriveVariantColors("primary", "red")).toThrow(
      '@hackert-ui/core: cannot derive colours for variant "primary" from "red"',
    );
  });

  it("rejects translucent colours, whose contrast depends on what is behind them", () => {
    expect(() => deriveVariantColors("primary", "rgb(0 0 0 / 50%)")).toThrow(
      'variant "primary" from "rgb(0 0 0 / 50%)" — the colour must be opaque',
    );
  });
});
