import { act, renderHook } from "@testing-library/react";
import { StrictMode } from "react";
import { describe, expect, it, vi } from "vite-plus/test";
import { useDisclosure } from "./useDisclosure";

describe("useDisclosure", () => {
  it("opens, closes and toggles", () => {
    const { result } = renderHook(() => useDisclosure());

    expect(result.current[0]).toBe(false);

    act(() => result.current[1].open());
    expect(result.current[0]).toBe(true);

    act(() => result.current[1].close());
    expect(result.current[0]).toBe(false);

    act(() => result.current[1].toggle());
    expect(result.current[0]).toBe(true);
  });

  it("keeps handlers referentially stable across re-renders", () => {
    const { result, rerender } = renderHook(() => useDisclosure());
    const handlers = result.current[1];

    act(() => result.current[1].open());
    rerender();

    expect(result.current[1]).toBe(handlers);
  });

  it("notifies callbacks and still updates state", () => {
    const onOpen = vi.fn();
    const onClose = vi.fn();
    const { result } = renderHook(() => useDisclosure(false, { onOpen, onClose }));

    act(() => result.current[1].open());
    expect(result.current[0]).toBe(true);
    expect(onOpen).toHaveBeenCalledTimes(1);

    act(() => result.current[1].close());
    expect(result.current[0]).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls the latest option callbacks after a re-render", () => {
    const onClose = vi.fn();
    const { result, rerender } = renderHook(
      ({ cb }: { cb: () => void }) => useDisclosure(true, { onClose: cb }),
      { initialProps: { cb: vi.fn() } },
    );

    rerender({ cb: onClose });
    act(() => result.current[1].close());

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(result.current[0]).toBe(false);
  });

  it("does not fire callbacks when the state is unchanged", () => {
    const onOpen = vi.fn();
    const { result } = renderHook(() => useDisclosure(true, { onOpen }));

    act(() => result.current[1].open());

    expect(onOpen).not.toHaveBeenCalled();
  });
});

describe("useDisclosure under StrictMode", () => {
  it("still transitions after a double-invoked render", () => {
    const onOpen = vi.fn();
    const { result } = renderHook(() => useDisclosure(false, { onOpen }), {
      wrapper: StrictMode,
    });

    act(() => result.current[1].open());

    expect(result.current[0]).toBe(true);
    expect(onOpen).toHaveBeenCalledTimes(1);

    act(() => result.current[1].toggle());
    expect(result.current[0]).toBe(false);
  });
});
