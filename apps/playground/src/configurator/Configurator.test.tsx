// @vitest-environment jsdom

import { DEFAULT_THEME } from "@hackert-ui/core";
import { Button } from "@hackert-ui/ui";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vite-plus/test";

import { Configurator } from "./Configurator";
import { defineControls } from "./controls";
import { defaultsFor } from "./search";
import { toJsx } from "./to-jsx";

afterEach(cleanup);

const CONTROLS = defineControls([
  {
    kind: "swatches",
    prop: "color",
    label: "Color",
    options: ["primary", "danger"],
    defaultValue: "primary",
  },
  { kind: "switch", prop: "disabled", label: "Disabled", defaultValue: false },
]);

function Harness() {
  const [values, setValues] = useState(defaultsFor(CONTROLS));

  return (
    <Configurator
      controls={CONTROLS}
      values={values}
      onChange={(patch) => setValues((prev) => ({ ...prev, ...patch }))}
      code={toJsx("Button", values, defaultsFor(CONTROLS), "Preview")}
    >
      <Button {...values}>Preview</Button>
    </Configurator>
  );
}

describe("Configurator", () => {
  it("restyles the preview and rewrites the code when a swatch is picked", () => {
    render(<Harness />);

    fireEvent.click(screen.getByRole("radio", { name: "danger" }));

    const preview = screen.getByRole("button", { name: "Preview" });
    expect(preview.style.getPropertyValue("--hui-bg")).toBe(
      `light-dark(${DEFAULT_THEME.colors.danger}, ${DEFAULT_THEME.dark.colors.danger})`,
    );
    expect(screen.getByText('<Button color="danger">Preview</Button>')).toBeTruthy();
  });

  it("toggles a boolean prop from its switch", () => {
    render(<Harness />);

    fireEvent.click(screen.getByRole("switch", { name: "Disabled" }));

    expect(screen.getByRole("button", { name: "Preview" }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("switch", { name: "Disabled" }).getAttribute("aria-checked")).toBe(
      "true",
    );
  });
});
