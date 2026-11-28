// @vitest-environment jsdom

import { AppProvider, DEFAULT_THEME } from "@hackert-ui/core";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vite-plus/test";

import { Button } from "./Button";

afterEach(cleanup);

function variable(name: string) {
  return screen.getByRole("button").style.getPropertyValue(name);
}

// The light-scheme half of a variable, whether or not it is a light-dark() pair.
function lightVariable(name: string) {
  const value = variable(name);
  return /^light-dark\((.*?), (?:rgb|#|[a-z]).*\)$/.exec(value)?.[1] ?? value;
}

describe("Button", () => {
  it("paints the resolved theme colour for its color", () => {
    render(
      <AppProvider theme={{ colors: { danger: "rgb(1, 2, 3)" } }}>
        <Button color="danger">Delete</Button>
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
        <Button color="primary">Save</Button>
        <Button color="warning">Careful</Button>
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

  it("shows a spinner in place of its content while loading", () => {
    render(<Button loading>Save</Button>);
    const button = screen.getByRole("button");

    expect(button.querySelector(".hui-loader")).not.toBeNull();
    expect(button.querySelector(".hui-button-loader")?.getAttribute("aria-hidden")).toBe("true");
    expect(button.textContent).toBe("Save");
  });

  it("passes loaderProps to its spinner", () => {
    render(
      <Button loading loaderProps={{ type: "dots" }}>
        Save
      </Button>,
    );

    expect(screen.getByRole("button").querySelector<HTMLElement>(".hui-loader")?.dataset.type).toBe(
      "dots",
    );
  });

  it("has no spinner when idle", () => {
    render(<Button>Save</Button>);

    expect(screen.getByRole("button").querySelector(".hui-loader")).toBeNull();
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

  it("is filled by default", () => {
    render(<Button>Save</Button>);

    expect(screen.getByRole("button").dataset.variant).toBe("filled");
  });

  it("accepts any CSS colour, named or not", () => {
    render(
      <>
        <Button color="tomato">Named</Button>
        <Button color="#0ea5e9">Hex</Button>
      </>,
    );
    const [named, hex] = screen.getAllByRole("button");

    expect(named?.style.getPropertyValue("--hui-bg")).toBe("tomato");
    expect(hex?.style.getPropertyValue("--hui-bg")).toBe("#0ea5e9");
  });

  it("tints the background and colours the text for the light variant", () => {
    render(
      <Button variant="light" color="#2563eb">
        Save
      </Button>,
    );

    expect(lightVariable("--hui-bg")).toBe("rgb(37 99 235 / 0.1)");
    expect(lightVariable("--hui-fg")).toBe("#2563eb");
  });

  it("draws a coloured border on a clear background for the outline variant", () => {
    render(
      <Button variant="outline" color="#2563eb">
        Save
      </Button>,
    );

    expect(variable("--hui-bg")).toBe("transparent");
    expect(lightVariable("--hui-bd")).toBe("#2563eb");
    expect(lightVariable("--hui-bg-hover")).toBe("rgb(37 99 235 / 0.1)");
  });

  it("shows a tint only on hover for the subtle variant", () => {
    render(
      <Button variant="subtle" color="#2563eb">
        Save
      </Button>,
    );

    expect(variable("--hui-bg")).toBe("transparent");
    expect(lightVariable("--hui-bg-hover")).toBe("rgb(37 99 235 / 0.1)");
  });

  it("never paints a background for the transparent variant", () => {
    render(
      <Button variant="transparent" color="#2563eb">
        Save
      </Button>,
    );

    expect(variable("--hui-bg")).toBe("transparent");
    expect(variable("--hui-bg-hover")).toBe("transparent");
    expect(lightVariable("--hui-fg")).toBe("#2563eb");
  });

  it("ignores color for the neutral default variant", () => {
    render(
      <>
        <Button variant="default">One</Button>
        <Button variant="default" color="danger">
          Two
        </Button>
      </>,
    );
    const [one, two] = screen.getAllByRole("button");

    expect(one?.style.getPropertyValue("--hui-bg")).toBe(two?.style.getPropertyValue("--hui-bg"));
    expect(one?.style.getPropertyValue("--hui-fg")).toBe(two?.style.getPropertyValue("--hui-fg"));
  });

  it("renders left and right sections around the label", () => {
    render(
      <Button leftSection={<span>L</span>} rightSection={<span>R</span>}>
        Save
      </Button>,
    );
    const button = screen.getByRole("button");

    expect(
      within(button).getByText("L").closest("[data-position]")?.getAttribute("data-position"),
    ).toBe("left");
    expect(
      within(button).getByText("R").closest("[data-position]")?.getAttribute("data-position"),
    ).toBe("right");
    expect(button.textContent).toBe("LSaveR");
  });

  it("centres its content unless told to space it out", () => {
    const { rerender } = render(<Button>Save</Button>);
    expect(screen.getByRole("button").dataset.justify).toBe("center");

    rerender(<Button justify="space-between">Save</Button>);
    expect(screen.getByRole("button").dataset.justify).toBe("space-between");
  });

  it("stretches to its container with fullWidth", () => {
    render(<Button fullWidth>Save</Button>);

    expect(screen.getByRole("button").hasAttribute("data-full-width")).toBe(true);
  });

  it("keeps color off the DOM element", () => {
    render(<Button color="danger">Delete</Button>);

    expect(screen.getByRole("button").hasAttribute("color")).toBe(false);
  });
});
