import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";

import { useModalsStack } from "./useModalsStack";

const IDS = ["delete-page", "confirm-action"] as const;

function setup() {
  return renderHook(() => useModalsStack(IDS));
}

describe("useModalsStack", () => {
  it("starts with every modal closed", () => {
    const { result } = setup();

    expect(result.current.state).toEqual({ "delete-page": false, "confirm-action": false });
  });

  it("opens and closes one modal by id, leaving the others", () => {
    const { result } = setup();

    act(() => result.current.open("delete-page"));
    act(() => result.current.open("confirm-action"));
    act(() => result.current.close("delete-page"));

    expect(result.current.state).toEqual({ "delete-page": false, "confirm-action": true });
  });

  it("toggles a modal", () => {
    const { result } = setup();

    act(() => result.current.toggle("delete-page"));
    expect(result.current.state["delete-page"]).toBe(true);

    act(() => result.current.toggle("delete-page"));
    expect(result.current.state["delete-page"]).toBe(false);
  });

  it("closes every modal at once", () => {
    const { result } = setup();

    act(() => result.current.open("delete-page"));
    act(() => result.current.open("confirm-action"));
    act(() => result.current.closeAll());

    expect(result.current.state).toEqual({ "delete-page": false, "confirm-action": false });
  });

  it("registers a modal with its opened state, a closer and its stack id", () => {
    const { result } = setup();

    act(() => result.current.open("confirm-action"));
    const props = result.current.register("confirm-action");
    expect(props.opened).toBe(true);
    expect(props.stackId).toBe("confirm-action");

    act(() => props.onClose());
    expect(result.current.state["confirm-action"]).toBe(false);
  });

  it("keeps its handlers stable across renders", () => {
    const { result, rerender } = setup();
    const { open, close, toggle, closeAll } = result.current;

    act(() => result.current.open("delete-page"));
    rerender();

    expect(result.current.open).toBe(open);
    expect(result.current.close).toBe(close);
    expect(result.current.toggle).toBe(toggle);
    expect(result.current.closeAll).toBe(closeAll);
  });
});
