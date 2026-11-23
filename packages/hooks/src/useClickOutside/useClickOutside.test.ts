import { cleanup, fireEvent, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { useClickOutside } from "./useClickOutside";

function renderWithElement(callback: () => void) {
  const inside = document.createElement("div");
  const child = document.createElement("span");
  const outside = document.createElement("div");
  inside.append(child);
  document.body.append(inside, outside);

  const hook = renderHook(({ cb }) => useClickOutside<HTMLDivElement>(cb), {
    initialProps: { cb: callback },
  });
  hook.result.current.current = inside;

  return { ...hook, inside, child, outside };
}

function listenerCalls(spy: { mock: { calls: unknown[][] } }) {
  return spy.mock.calls.filter(([type]) => type === "mousedown" || type === "touchstart");
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

describe("useClickOutside", () => {
  it("calls the callback on mousedown outside the element", () => {
    const callback = vi.fn();
    const { outside } = renderWithElement(callback);

    fireEvent.mouseDown(outside);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("calls the callback on touchstart outside the element", () => {
    const callback = vi.fn();
    const { outside } = renderWithElement(callback);

    fireEvent.touchStart(outside);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("ignores mousedown on the element itself", () => {
    const callback = vi.fn();
    const { inside } = renderWithElement(callback);

    fireEvent.mouseDown(inside);

    expect(callback).not.toHaveBeenCalled();
  });

  it("ignores mousedown on a child of the element", () => {
    const callback = vi.fn();
    const { child } = renderWithElement(callback);

    fireEvent.mouseDown(child);

    expect(callback).not.toHaveBeenCalled();
  });

  it("calls the latest callback after a re-render", () => {
    const first = vi.fn();
    const latest = vi.fn();
    const { rerender, outside } = renderWithElement(first);

    rerender({ cb: latest });
    fireEvent.mouseDown(outside);

    expect(first).not.toHaveBeenCalled();
    expect(latest).toHaveBeenCalledTimes(1);
  });

  it("does not re-subscribe when re-rendered with a new inline callback", () => {
    const addSpy = vi.spyOn(document, "addEventListener");
    const removeSpy = vi.spyOn(document, "removeEventListener");
    const { rerender } = renderWithElement(() => {});
    const subscriptions = listenerCalls(addSpy).length;

    rerender({ cb: () => {} });
    rerender({ cb: () => {} });

    expect(listenerCalls(addSpy)).toHaveLength(subscriptions);
    expect(listenerCalls(removeSpy)).toHaveLength(0);
  });

  it("removes its listeners on unmount", () => {
    const removeSpy = vi.spyOn(document, "removeEventListener");
    const callback = vi.fn();
    const { unmount, outside } = renderWithElement(callback);

    unmount();
    fireEvent.mouseDown(outside);
    fireEvent.touchStart(outside);

    expect(callback).not.toHaveBeenCalled();
    expect(listenerCalls(removeSpy).map(([type]) => type)).toEqual(["mousedown", "touchstart"]);
  });
});
