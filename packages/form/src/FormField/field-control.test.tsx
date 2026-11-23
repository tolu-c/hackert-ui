// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vite-plus/test";

import { useAppForm } from "../form-hook";
import { FormField } from "./FormField";

afterEach(cleanup);

type Control = "TextInput" | "TextArea" | "NumberInput" | "SelectInput" | "Searchable";

const CONTROLS: readonly Control[] = [
  "TextInput",
  "TextArea",
  "NumberInput",
  "SelectInput",
  "Searchable",
];

const OPTIONS = [{ value: "a", label: "A" }];

function Harness({ control, wrapped }: { readonly control: Control; readonly wrapped: boolean }) {
  const form = useAppForm({
    defaultValues: { text: "", amount: null as number | null },
    validators: { onBlur: () => ({ fields: { text: "Bad text", amount: "Bad amount" } }) },
  });
  const name = control === "NumberInput" ? "amount" : "text";

  return (
    <form.AppField name={name}>
      {(field) => {
        const input = {
          TextInput: <field.TextInput aria-label="Control" />,
          TextArea: <field.TextArea aria-label="Control" />,
          NumberInput: <field.NumberInput aria-label="Control" />,
          SelectInput: <field.SelectInput aria-label="Control" options={OPTIONS} />,
          Searchable: (
            <field.SelectInput aria-label="Control" mode="searchable" options={OPTIONS} />
          ),
        }[control];
        if (!wrapped) return input;
        return (
          <FormField>
            <FormField.Label>Label</FormField.Label>
            {input}
            <FormField.Description>Help</FormField.Description>
            <FormField.Error />
          </FormField>
        );
      }}
    </form.AppField>
  );
}

describe.each(CONTROLS)("%s", (control) => {
  it("is labelled by FormField.Label and described by the description and error", () => {
    render(<Harness control={control} wrapped />);

    const element = screen.getByLabelText("Label");
    const errorId = document.querySelector("[aria-live]")?.id;

    expect(element.getAttribute("aria-describedby")).toBe(
      `${screen.getByText("Help").id} ${errorId}`,
    );
  });

  it("has an id and no aria-describedby outside a FormField", () => {
    render(<Harness control={control} wrapped={false} />);

    const element = screen.getByLabelText("Control");

    expect(element.id).not.toBe("");
    expect(element.hasAttribute("aria-describedby")).toBe(false);
  });

  it("becomes aria-invalid once blurred with an error", async () => {
    const user = userEvent.setup();
    render(<Harness control={control} wrapped={false} />);

    expect(screen.getByLabelText("Control").hasAttribute("aria-invalid")).toBe(false);
    await user.click(screen.getByLabelText("Control"));
    await user.tab();

    expect(screen.getByLabelText("Control").getAttribute("aria-invalid")).toBe("true");
  });
});
