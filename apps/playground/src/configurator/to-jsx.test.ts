import { describe, expect, it } from "vite-plus/test";

import { toJsx, toSnippet } from "./to-jsx";

describe("toJsx", () => {
  it("omits props that match their defaults", () => {
    expect(
      toJsx(
        "Button",
        { variant: "primary", size: "lg" },
        { variant: "primary", size: "md" },
        "Save",
      ),
    ).toBe('<Button size="lg">Save</Button>');
  });

  it("uses shorthand for true and an expression for false", () => {
    expect(toJsx("Button", { disabled: true }, { disabled: false }, "Save")).toBe(
      "<Button disabled>Save</Button>",
    );
    expect(toJsx("Input", { autoFocus: false }, { autoFocus: true })).toBe(
      "<Input autoFocus={false} />",
    );
  });

  it("self-closes without children", () => {
    expect(toJsx("Input", { label: "Email" }, { label: "" })).toBe('<Input label="Email" />');
    expect(toJsx("Card", {}, {}, "")).toBe("<Card />");
  });

  it("escapes strings that would break JSX", () => {
    expect(toJsx("Input", { label: 'Say "hi"' }, { label: "" })).toBe(
      '<Input label={"Say \\"hi\\""} />',
    );
    expect(toJsx("Button", {}, {}, "a < b")).toBe('<Button>{"a < b"}</Button>');
  });
});

describe("toSnippet", () => {
  it("wraps the element in an import and a component", () => {
    expect(toSnippet('import { Button } from "@hackert-ui/ui";', "<Button>Save</Button>")).toBe(
      'import { Button } from "@hackert-ui/ui";\n\nfunction Demo() {\n  return <Button>Save</Button>;\n}',
    );
  });
});
