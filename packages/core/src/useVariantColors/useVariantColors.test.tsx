// @vitest-environment jsdom

import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vite-plus/test";

import { AppProvider, DEFAULT_THEME } from "../index";
import { useVariantColors } from "./useVariantColors";

describe("useVariantColors", () => {
  it("derives colours from the default theme without a provider", () => {
    const { result } = renderHook(() => useVariantColors("primary"));

    expect(result.current.background).toBe(DEFAULT_THEME.colors.primary);
    expect(result.current.foreground).toBe("#ffffff");
  });

  it("follows an AppProvider override", () => {
    function wrapper({ children }: { children: ReactNode }) {
      return <AppProvider theme={{ colors: { primary: "#fde047" } }}>{children}</AppProvider>;
    }

    const { result } = renderHook(() => useVariantColors("primary"), { wrapper });

    expect(result.current.background).toBe("#fde047");
    expect(result.current.foreground).toBe("#0a0a0a");
  });

  it("derives from the dark palette for the dark scheme", () => {
    const { result } = renderHook(() => useVariantColors("primary", "dark"));

    expect(result.current.background).toBe(DEFAULT_THEME.dark.colors.primary);
  });
});
