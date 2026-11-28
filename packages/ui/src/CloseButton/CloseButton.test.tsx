// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { CloseButton } from "./CloseButton";

afterEach(cleanup);

describe("CloseButton", () => {
  it("is a button named Close by default", () => {
    render(<CloseButton />);

    expect(screen.getByRole("button", { name: "Close" }).getAttribute("type")).toBe("button");
  });

  it("takes a custom accessible name", () => {
    render(<CloseButton aria-label="Dismiss" />);

    expect(screen.getByRole("button", { name: "Dismiss" })).toBeTruthy();
  });

  it("draws an X icon unless given children", () => {
    const { rerender } = render(<CloseButton />);
    expect(screen.getByRole("button").querySelector("svg")).not.toBeNull();

    rerender(<CloseButton>✕</CloseButton>);
    expect(screen.getByRole("button").querySelector("svg")).toBeNull();
    expect(screen.getByRole("button").textContent).toBe("✕");
  });

  it("sizes itself from a size key", () => {
    render(<CloseButton size="lg" />);

    expect(screen.getByRole("button").style.getPropertyValue("--hui-close-size")).toBe("34px");
  });

  it("calls onClick", () => {
    const onClick = vi.fn();
    render(<CloseButton onClick={onClick} />);

    fireEvent.click(screen.getByRole("button"));

    expect(onClick).toHaveBeenCalledOnce();
  });
});
