// @vitest-environment jsdom

import { AppProvider, DEFAULT_THEME } from "@hackert-ui/core";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vite-plus/test";

import { Button } from "./Button";

afterEach(cleanup);

function variable(name: string) {
  return screen.getByRole("button").style.getPropertyValue(name);
}

describe("Button", () => {
  it("paints the resolved theme colour for its variant", () => {
    render(
      <AppProvider theme={{ colors: { danger: "rgb(1, 2, 3)" } }}>
        <Button variant="danger">Delete</Button>
      </AppProvider>,
    );

    expect(variable("--hui-bg")).toBe("rgb(1, 2, 3)");
  });

  it("carries light and dark colours and lets the page's color-scheme pick", () => {
    render(<Button>Save</Button>);

    expect(variable("--hui-bg")).toBe(
      `light-dark(${DEFAULT_THEME.colors.primary}, ${DEFAULT_THEME.dark.colors.primary})`,
    );
  });

  it("derives readable text from the background", () => {
    render(
      <>
        <Button variant="primary">Save</Button>
        <Button variant="warning">Careful</Button>
      </>,
    );
    const [primary, warning] = screen.getAllByRole("button");

    expect(primary?.style.getPropertyValue("--hui-fg")).toBe("light-dark(#ffffff, #0a0a0a)");
    expect(warning?.style.getPropertyValue("--hui-fg")).toBe("#0a0a0a");
  });

  it("provides hover and active colours", () => {
    render(<Button>Save</Button>);

    expect(variable("--hui-bg-hover")).toMatch(/^light-dark\(#[0-9a-f]{6}, #[0-9a-f]{6}\)$/);
    expect(variable("--hui-fg-hover")).toBe("light-dark(#ffffff, #0a0a0a)");
    expect(variable("--hui-bg-active")).toMatch(/^light-dark\(#[0-9a-f]{6}, #[0-9a-f]{6}\)$/);
  });

  it("falls back to the default theme without a provider", () => {
    render(<Button>Save</Button>);

    expect(variable("--hui-radius")).toBe(DEFAULT_THEME.radius.md);
  });

  it("pads from the spacing scale by size", () => {
    render(<Button size="lg">Save</Button>);

    expect(variable("--hui-py")).toBe(DEFAULT_THEME.spacing.md);
    expect(variable("--hui-px")).toBe(DEFAULT_THEME.spacing.lg);
  });

  it("scales its text with size", () => {
    render(
      <>
        <Button size="xs">Small</Button>
        <Button>Default</Button>
        <Button size="2xl">Large</Button>
      </>,
    );
    const sizes = screen
      .getAllByRole("button")
      .map((button) => button.style.getPropertyValue("--hui-font-size"));

    expect(sizes).toEqual(["12px", "16px", "24px"]);
  });

  it("adds one shared stylesheet to the document however many buttons render", () => {
    render(
      <>
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </>,
    );

    expect(document.head.querySelectorAll('style[data-href="hui-button"]')).toHaveLength(1);
  });

  it("fixes the layer order so a reset loaded later cannot outrank it", () => {
    render(<Button>Save</Button>);
    const css = document.head.querySelector('style[data-href="hui-button"]')?.textContent ?? "";

    expect(css.startsWith("@layer theme, base, components, utilities;")).toBe(true);
  });

  it("keeps the consumer's className alongside its own", () => {
    render(<Button className="mt-4">Save</Button>);

    expect(screen.getByRole("button").className).toBe("hui-button mt-4");
  });

  it("lets the consumer's style override a themed variable", () => {
    render(<Button style={{ ["--hui-bg" as string]: "rgb(9, 9, 9)" }}>Save</Button>);

    expect(variable("--hui-bg")).toBe("rgb(9, 9, 9)");
  });

  it("defaults to type=button", () => {
    render(<Button>Save</Button>);

    expect(screen.getByRole("button").getAttribute("type")).toBe("button");
  });

  it("disables itself and reports busy while loading", () => {
    render(<Button loading>Save</Button>);
    const button = screen.getByRole("button") as HTMLButtonElement;

    expect(button.disabled).toBe(true);
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(button.hasAttribute("data-loading")).toBe(true);
  });

  it("keeps loading off the DOM element", () => {
    render(<Button loading>Save</Button>);

    expect(screen.getByRole("button").hasAttribute("loading")).toBe(false);
  });

  it("is idle when not loading", () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole("button") as HTMLButtonElement;

    expect(button.disabled).toBe(false);
    expect(button.hasAttribute("aria-busy")).toBe(false);
  });
});
