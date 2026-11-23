// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { Form } from "../Form";
import { useAppForm } from "../form-hook";

afterEach(cleanup);

let finish: () => void = () => {};

function Harness({
  disabled,
  name = "Ada",
  variant,
}: {
  readonly disabled?: boolean;
  readonly name?: string;
  readonly variant?: "primary" | "danger";
}) {
  const form = useAppForm({
    defaultValues: { name },
    validators: {
      onChange: ({ value }) => (value.name ? undefined : { fields: { name: "Required" } }),
      onSubmitAsync: () => new Promise((resolve) => (finish = () => resolve(undefined))),
    },
  });

  return (
    <Form form={form}>
      <form.SubmitButton disabled={disabled} variant={variant}>
        Save
      </form.SubmitButton>
    </Form>
  );
}

function button() {
  return screen.getByRole("button", { name: "Save" }) as HTMLButtonElement;
}

describe("SubmitButton", () => {
  it("is a submit button, idle by default", () => {
    render(<Harness />);

    expect(button().type).toBe("submit");
    expect(button().disabled).toBe(false);
    expect(button().hasAttribute("data-submitting")).toBe(false);
  });

  it("flags the submitting state for styling and assistive tech", async () => {
    render(<Harness />);

    await userEvent.setup().click(button());

    expect(button().hasAttribute("data-submitting")).toBe(true);
    expect(button().getAttribute("aria-busy")).toBe("true");

    finish();
    await vi.waitFor(() => expect(button().hasAttribute("data-submitting")).toBe(false));
    expect(button().getAttribute("aria-busy")).toBeNull();
  });

  it("respects its own disabled prop", () => {
    render(<Harness disabled />);

    expect(button().disabled).toBe(true);
  });

  it("flags data-invalid once a submit is blocked by validation", async () => {
    render(<Harness name="" />);
    expect(button().hasAttribute("data-invalid")).toBe(false);

    await userEvent.setup().click(button());

    expect(button().hasAttribute("data-invalid")).toBe(true);
  });

  it("renders the themed Button from @hackert-ui/ui", () => {
    render(<Harness variant="danger" />);

    expect(button().className).toContain("hui-button");
    expect(button().style.getPropertyValue("--hui-bg")).not.toBe("");
  });

  it("reuses Button's loading state while submitting", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(button());

    expect(button().hasAttribute("data-loading")).toBe(true);
    finish();
  });
});
