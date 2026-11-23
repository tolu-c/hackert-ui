// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { useAppForm } from "../form-hook";

afterEach(cleanup);

interface HarnessProps {
  readonly onChange?: (value: string) => void;
  readonly onBlur?: () => void;
}

function Harness({ onChange, onBlur }: HarnessProps) {
  const form = useAppForm({ defaultValues: { name: "Ada", bio: "Hi" } });

  return (
    <>
      <form.AppField name="name" listeners={{ onChange: ({ value }) => onChange?.(value) }}>
        {(field) => (
          <field.TextInput type="email" className="x" placeholder="Name" onBlur={onBlur} />
        )}
      </form.AppField>
      <form.AppField name="bio">
        {(field) => <field.TextArea placeholder="Bio" onBlur={onBlur} />}
      </form.AppField>
    </>
  );
}

describe("TextInput", () => {
  it("shows the field value and passes native props through", () => {
    render(<Harness />);

    const input = screen.getByPlaceholderText("Name") as HTMLInputElement;

    expect(input.value).toBe("Ada");
    expect(input.type).toBe("email");
    expect(input.className).toBe("x");
  });

  it("writes typing back to the field", async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    await userEvent.setup().type(screen.getByPlaceholderText("Name"), "!");

    expect(onChange).toHaveBeenLastCalledWith("Ada!");
  });

  it("works outside a FormField with its own id", () => {
    render(<Harness />);

    expect(screen.getByPlaceholderText("Name").id).not.toBe("");
  });

  it("still calls the caller's onBlur", async () => {
    const user = userEvent.setup();
    const onBlur = vi.fn();
    render(<Harness onBlur={onBlur} />);

    await user.click(screen.getByPlaceholderText("Name"));
    await user.tab();

    expect(onBlur).toHaveBeenCalledTimes(1);
  });
});

describe("TextArea", () => {
  it("renders a textarea bound to the field", async () => {
    render(<Harness />);

    const area = screen.getByPlaceholderText("Bio") as HTMLTextAreaElement;
    await userEvent.setup().type(area, "hello");

    expect(area.tagName).toBe("TEXTAREA");
    expect(area.value).toBe("Hihello");
  });

  it("still calls the caller's onBlur", async () => {
    const user = userEvent.setup();
    const onBlur = vi.fn();
    render(<Harness onBlur={onBlur} />);

    await user.click(screen.getByPlaceholderText("Bio"));
    await user.tab();

    expect(onBlur).toHaveBeenCalledTimes(1);
  });
});
