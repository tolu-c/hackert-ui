import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { useCopy } from "./useCopy";

function mockClipboard(writeText = vi.fn().mockResolvedValue(undefined)) {
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
  return writeText;
}

function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  Reflect.deleteProperty(navigator, "clipboard");
});

describe("useCopy", () => {
  it("works without options", () => {
    const { result } = renderHook(() => useCopy());

    expect(result.current.isCopied).toBe(false);
  });

  it("writes the text to the clipboard", async () => {
    const writeText = mockClipboard();
    const { result } = renderHook(() => useCopy());

    await act(async () => result.current.copy("hello"));

    expect(writeText).toHaveBeenCalledWith("hello");
  });

  it("sets isCopied after a successful copy", async () => {
    mockClipboard();
    const { result } = renderHook(() => useCopy());

    await act(async () => result.current.copy("hello"));

    expect(result.current.isCopied).toBe(true);
  });

  it("resets isCopied after the default 1000ms", async () => {
    mockClipboard();
    const { result } = renderHook(() => useCopy());

    await act(async () => result.current.copy("hello"));
    advance(999);
    expect(result.current.isCopied).toBe(true);

    advance(1);
    expect(result.current.isCopied).toBe(false);
  });

  it("honours a custom timeout", async () => {
    mockClipboard();
    const { result } = renderHook(() => useCopy({ timeout: 200 }));

    await act(async () => result.current.copy("hello"));
    advance(199);
    expect(result.current.isCopied).toBe(true);

    advance(1);
    expect(result.current.isCopied).toBe(false);
  });

  it("uses the latest timeout after it changes between renders", async () => {
    mockClipboard();
    const { result, rerender } = renderHook(({ timeout }) => useCopy({ timeout }), {
      initialProps: { timeout: 200 },
    });

    rerender({ timeout: 500 });
    await act(async () => result.current.copy("hello"));
    advance(499);
    expect(result.current.isCopied).toBe(true);

    advance(1);
    expect(result.current.isCopied).toBe(false);
  });

  it("restarts the timer when copying again", async () => {
    mockClipboard();
    const { result } = renderHook(() => useCopy());

    await act(async () => result.current.copy("first"));
    advance(800);
    await act(async () => result.current.copy("second"));
    advance(800);
    expect(result.current.isCopied).toBe(true);

    advance(200);
    expect(result.current.isCopied).toBe(false);
  });

  it("clears the pending reset on unmount", async () => {
    mockClipboard();
    const { result, unmount } = renderHook(() => useCopy());

    await act(async () => result.current.copy("hello"));
    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });

  it("does not schedule a reset when the copy resolves after unmount", async () => {
    let resolve = () => {};
    mockClipboard(vi.fn().mockReturnValue(new Promise<void>((r) => (resolve = r))));
    const { result, unmount } = renderHook(() => useCopy());

    act(() => result.current.copy("hello"));
    unmount();
    await act(async () => resolve());

    expect(vi.getTimerCount()).toBe(0);
  });

  it("stays false when the clipboard write is rejected", async () => {
    mockClipboard(vi.fn().mockRejectedValue(new Error("denied")));
    const { result } = renderHook(() => useCopy());

    await act(async () => result.current.copy("hello"));

    expect(result.current.isCopied).toBe(false);
  });

  it("does not throw when the Clipboard API is unavailable", () => {
    Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true });
    const { result } = renderHook(() => useCopy());

    expect(() => act(() => result.current.copy("hello"))).not.toThrow();
  });
});
