// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vite-plus/test";

import { useScrolled } from "./scrolled";

function scrollTo(y: number) {
  Object.defineProperty(window, "scrollY", { value: y, configurable: true });
  window.dispatchEvent(new Event("scroll"));
}

afterEach(() => {
  Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
});

describe("useScrolled", () => {
  it("is false at the top of the page", () => {
    const { result } = renderHook(() => useScrolled());

    expect(result.current).toBe(false);
  });

  it("turns true once the page scrolls past the threshold, and back at the top", () => {
    const { result } = renderHook(() => useScrolled());

    act(() => scrollTo(40));
    expect(result.current).toBe(true);

    act(() => scrollTo(0));
    expect(result.current).toBe(false);
  });

  it("ignores scrolling within the threshold", () => {
    const { result } = renderHook(() => useScrolled(8));

    act(() => scrollTo(8));

    expect(result.current).toBe(false);
  });
});
