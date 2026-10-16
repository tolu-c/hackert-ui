// @vitest-environment jsdom

import { AppProvider, DEFAULT_THEME } from "@hackert-ui/core";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Button } from "./Button";

afterEach(cleanup);

describe("Button", () => {
  it("paints the resolved theme colour for its variant", () => {
    render(
      <AppProvider theme={{ colors: { danger: "rgb(1, 2, 3)" } }}>
        <Button variant="danger">Delete</Button>
      </AppProvider>,
    );

    expect(screen.getByRole("button").style.backgroundColor).toBe(
      "rgb(1, 2, 3)",
    );
  });

  it("falls back to the default theme without a provider", () => {
    render(<Button>Save</Button>);

    expect(screen.getByRole("button").style.borderRadius).toBe(
      DEFAULT_THEME.radius.md,
    );
  });

  it("lets the consumer's className and style win", () => {
    render(
      <Button className="mt-4" style={{ backgroundColor: "rgb(9, 9, 9)" }}>
        Save
      </Button>,
    );
    const button = screen.getByRole("button");

    expect(button.className).toBe("my-button cursor-pointer mt-4");
    expect(button.style.backgroundColor).toBe("rgb(9, 9, 9)");
  });

  it("defaults to type=button", () => {
    render(<Button>Save</Button>);

    expect(screen.getByRole("button").getAttribute("type")).toBe("button");
  });
});
