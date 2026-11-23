// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vite-plus/test";

import { Form } from "../Form";
import { useAppForm } from "../form-hook";

afterEach(cleanup);

function Harness({ onSubmitAsync }: { readonly onSubmitAsync?: () => Promise<unknown> }) {
  const form = useAppForm({
    defaultValues: { name: "" },
    validators: {
      onChange: ({ value }) => (value.name ? undefined : { fields: { name: "Required" } }),
      ...(onSubmitAsync ? { onSubmitAsync } : {}),
    },
  });

  return (
    <Form form={form}>
      <form.FormError className="banner" />
      <form.AppField name="name">{(field) => <field.TextInput aria-label="Name" />}</form.AppField>
      <form.SubmitButton>Save</form.SubmitButton>
    </Form>
  );
}

describe("FormError", () => {
  it("renders nothing while there are no form-level errors", () => {
    render(<Harness />);

    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("ignores field-level errors", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("announces a form error returned from onSubmitAsync", async () => {
    const user = userEvent.setup();
    render(<Harness onSubmitAsync={async () => ({ form: "Server is down" })} />);

    await user.type(screen.getByLabelText("Name"), "Ada");
    await user.click(screen.getByRole("button", { name: "Save" }));

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toBe("Server is down");
    expect(alert.className).toBe("banner");
  });
});
