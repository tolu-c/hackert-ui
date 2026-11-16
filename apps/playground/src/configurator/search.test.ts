import { describe, expect, it } from "vite-plus/test";

import { defineControls } from "./controls";
import { defaultsFor, searchOptionsFor, validateSearchFor } from "./search";

const CONTROLS = defineControls([
  {
    kind: "swatches",
    prop: "variant",
    label: "Variant",
    options: ["primary", "danger"],
    defaultValue: "primary",
  },
  { kind: "slider", prop: "size", label: "Size", options: ["sm", "md", "lg"], defaultValue: "md" },
  { kind: "switch", prop: "disabled", label: "Disabled", defaultValue: false },
  { kind: "text", prop: "label", label: "Label", defaultValue: "Button" },
]);

// The URL can hold anything, so the tests feed raw, untyped params.
const validateTyped = validateSearchFor(CONTROLS);
function validate(raw: Record<string, unknown>) {
  return validateTyped(raw as Parameters<typeof validateTyped>[0]);
}

describe("defaultsFor", () => {
  it("collects each control's default under its prop", () => {
    expect(defaultsFor(CONTROLS)).toEqual({
      variant: "primary",
      size: "md",
      disabled: false,
      label: "Button",
    });
  });
});

describe("validateSearchFor", () => {
  it("passes valid values through", () => {
    expect(validate({ variant: "danger", size: "lg", disabled: true, label: "Go" })).toEqual({
      variant: "danger",
      size: "lg",
      disabled: true,
      label: "Go",
    });
  });

  // Every declared key must be present: the router merges this output over the
  // parent route's raw search, so an omitted key would let the raw value through.
  it("replaces values outside a control's options or of the wrong type with the default", () => {
    expect(validate({ variant: "bogus", size: 3, disabled: "yes" })).toEqual(defaultsFor(CONTROLS));
  });

  it("ignores params no control declares", () => {
    expect(validate({ tracking: "abc" })).toEqual(defaultsFor(CONTROLS));
  });

  it("reads a numeric-looking label as text", () => {
    expect(validate({ label: 123 }).label).toBe("123");
  });
});

describe("searchOptionsFor", () => {
  it("keeps default values out of the URL", () => {
    const [stripDefaults] = searchOptionsFor(CONTROLS).search.middlewares;

    expect(
      stripDefaults?.({
        search: { ...defaultsFor(CONTROLS), size: "lg" },
        next: (search) => search,
      }),
    ).toEqual({ size: "lg" });
  });
});
