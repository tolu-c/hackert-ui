// @vitest-environment jsdom

import { AppProvider, DEFAULT_THEME } from "@hackert-ui/core";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vite-plus/test";

import { FormField } from "../FormField";
import { useAppForm } from "../form-hook";

afterEach(cleanup);

function Fields() {
  const form = useAppForm({ defaultValues: { first: "", last: "" } });

  return (
    <>
      <form.AppField name="first">
        {(field) => (
          <FormField>
            <FormField.Label>First</FormField.Label>
            <field.TextInput className="mt-2" />
          </FormField>
        )}
      </form.AppField>
      <form.AppField name="last">{(field) => <field.TextInput aria-label="Last" />}</form.AppField>
    </>
  );
}

function wrapperOf(element: HTMLElement) {
  const wrapper = element.closest<HTMLElement>(".hui-input-wrapper");
  if (!wrapper) throw new Error("no .hui-input-wrapper around the control");
  return wrapper;
}

describe("form styles", () => {
  it("adds one shared stylesheet however many fields render", () => {
    render(<Fields />);

    expect(document.head.querySelectorAll('style[data-href="hui-form"]')).toHaveLength(1);
  });

  it("fixes the layer order so the consumer's utilities win", () => {
    render(<Fields />);
    const css = document.head.querySelector('style[data-href="hui-form"]')?.textContent ?? "";

    expect(css.startsWith("@layer theme, base, components, utilities;")).toBe(true);
  });

  it("themes the control from AppProvider", () => {
    render(
      <AppProvider theme={{ colors: { primary: "rgb(1, 2, 3)" }, radius: { md: "3px" } }}>
        <Fields />
      </AppProvider>,
    );
    const wrapper = wrapperOf(screen.getByLabelText("Last"));

    expect(wrapper.style.getPropertyValue("--hui-primary")).toBe("rgb(1, 2, 3)");
    expect(wrapper.style.getPropertyValue("--hui-radius")).toBe("3px");
  });

  it("falls back to the default theme without a provider", () => {
    render(<Fields />);

    expect(wrapperOf(screen.getByLabelText("Last")).style.getPropertyValue("--hui-font")).toBe(
      DEFAULT_THEME.fontFamily,
    );
  });

  it("keeps the consumer's className next to its own", () => {
    render(<Fields />);

    expect(screen.getByLabelText("First").className).toBe("hui-input mt-2");
    expect(screen.getByText("First").className).toBe("hui-label");
  });

  it("colours an invalid field's label and description with the danger colour", () => {
    render(<Fields />);
    const css = document.head.querySelector('style[data-href="hui-form"]')?.textContent ?? "";

    expect(css).toMatch(
      /\.hui-field\[data-invalid\] > \.hui-label,\s*\.hui-field\[data-invalid\] > \.hui-description \{\s*color: var\(--hui-danger\);/,
    );
  });
});
