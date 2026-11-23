// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { Form } from "../Form";
import { useAppForm } from "../form-hook";
import { FormField } from "./FormField";

afterEach(cleanup);
afterEach(() => {
  vi.restoreAllMocks();
});

interface Options {
  readonly onSubmit?: (value: { email: string }) => void;
  readonly onSubmitAsync?: (args: { value: { email: string } }) => Promise<unknown>;
}

function EmailForm({ onSubmit, onSubmitAsync }: Options) {
  const form = useAppForm({
    defaultValues: { email: "" },
    validators: {
      onChange: ({ value }) =>
        value.email.includes("@") ? undefined : { fields: { email: "Enter an email" } },
      ...(onSubmitAsync ? { onSubmitAsync } : {}),
    },
    onSubmit: ({ value }) => onSubmit?.(value),
  });

  return (
    <Form form={form}>
      <form.FormError />
      <form.AppField name="email">
        {(field) => (
          <FormField>
            <FormField.Label>Email</FormField.Label>
            <field.TextInput />
            <FormField.Description>We never share it.</FormField.Description>
            <FormField.Error />
          </FormField>
        )}
      </form.AppField>
      <form.SubmitButton>Sign in</form.SubmitButton>
    </Form>
  );
}

describe("FormField", () => {
  it("wires the label, description and control together", () => {
    render(<EmailForm />);

    const input = screen.getByLabelText("Email");

    expect(input.getAttribute("aria-describedby")).toContain(
      screen.getByText("We never share it.").id,
    );
  });

  it("references both the description and the error element", () => {
    render(<EmailForm />);

    const describedBy = screen.getByLabelText("Email").getAttribute("aria-describedby");

    const errorId = document.querySelector("[aria-live]")?.id;

    expect(describedBy).toBe(`${screen.getByText("We never share it.").id} ${errorId}`);
  });

  it("keeps the error silent until the field is blurred", async () => {
    const user = userEvent.setup();
    render(<EmailForm />);
    const input = screen.getByLabelText("Email");

    await user.type(input, "a");
    expect(screen.queryByText("Enter an email")).toBeNull();
    expect(input.getAttribute("aria-invalid")).toBeNull();

    await user.tab();
    expect(screen.getByText("Enter an email")).toBeTruthy();
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toContain(screen.getByText("Enter an email").id);
  });

  it("shows errors after a submit attempt without touching the field", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<EmailForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Enter an email")).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits valid values", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<EmailForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Email"), "a@b.co");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(onSubmit).toHaveBeenCalledWith({ email: "a@b.co" });
  });

  it("shows server errors from onSubmitAsync on the field and the form", async () => {
    const user = userEvent.setup();
    render(
      <EmailForm
        onSubmitAsync={async () => ({ form: "Sign-in failed", fields: { email: "Already taken" } })}
      />,
    );

    await user.type(screen.getByLabelText("Email"), "a@b.co");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Already taken")).toBeTruthy();
    expect(screen.getByRole("alert").textContent).toBe("Sign-in failed");
  });

  it("always renders an empty polite live region for the error", () => {
    render(<EmailForm />);

    const error = document.querySelector("[aria-live]");

    expect(error?.tagName).toBe("P");
    expect(error?.getAttribute("aria-live")).toBe("polite");
    expect(error?.textContent).toBe("");
  });

  it("flags the wrapper with data-invalid while an error is shown", async () => {
    const user = userEvent.setup();
    const { container } = render(<EmailForm />);
    const wrapper = () => container.querySelector("form > div") as HTMLElement;

    expect(wrapper().hasAttribute("data-invalid")).toBe(false);
    await user.type(screen.getByLabelText("Email"), "a");
    await user.tab();

    expect(wrapper().hasAttribute("data-invalid")).toBe(true);
  });

  it("clears the error once the value is fixed", async () => {
    const user = userEvent.setup();
    render(<EmailForm />);
    const input = screen.getByLabelText("Email");

    await user.type(input, "a");
    await user.tab();
    await user.type(input, "@b.co");

    expect(screen.queryByText("Enter an email")).toBeNull();
    expect(input.hasAttribute("aria-invalid")).toBe(false);
  });

  it.each(["Label", "Description", "Error"] as const)(
    "throws a descriptive error when FormField.%s is outside a FormField",
    (part) => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      const Part = FormField[part];

      expect(() => render(<Part />)).toThrow(
        `FormField.${part} must be rendered inside <FormField>`,
      );
    },
  );

  it("disables the submit button while submitting", async () => {
    const user = userEvent.setup();
    let finish: () => void = () => {};
    render(
      <EmailForm
        onSubmitAsync={() => new Promise((resolve) => (finish = () => resolve(undefined)))}
      />,
    );

    await user.type(screen.getByLabelText("Email"), "a@b.co");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    const button = screen.getByRole("button", { name: "Sign in" }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(button.getAttribute("aria-busy")).toBe("true");

    finish();
    await vi.waitFor(() => expect(button.disabled).toBe(false));
  });
});
