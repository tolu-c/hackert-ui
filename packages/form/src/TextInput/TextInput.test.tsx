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
    expect(input.className).toBe("hui-input x");
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

function PasswordHarness(props: {
  readonly type?: "password" | "text";
  readonly visibilityToggle?: boolean;
  readonly visibilityToggleLabels?: { readonly show: string; readonly hide: string };
}) {
  const form = useAppForm({ defaultValues: { secret: "hunter2" } });

  return (
    <form.AppField name="secret">
      {(field) => <field.TextInput type="password" aria-label="Password" {...props} />}
    </form.AppField>
  );
}

describe("TextInput type=password", () => {
  it("shows a visibility toggle by default", () => {
    render(<PasswordHarness />);

    expect(screen.getByRole("button", { name: "Show password" }).getAttribute("aria-pressed")).toBe(
      "false",
    );
  });

  it("reveals and hides the password", async () => {
    const user = userEvent.setup();
    render(<PasswordHarness />);
    const input = screen.getByLabelText("Password") as HTMLInputElement;

    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(input.type).toBe("text");
    expect(screen.getByRole("button", { name: "Hide password" }).getAttribute("aria-pressed")).toBe(
      "true",
    );

    await user.click(screen.getByRole("button", { name: "Hide password" }));
    expect(input.type).toBe("password");
  });

  it("keeps focus in the input when the toggle is clicked", async () => {
    const user = userEvent.setup();
    render(<PasswordHarness />);
    const input = screen.getByLabelText("Password");

    await user.click(input);
    await user.click(screen.getByRole("button", { name: "Show password" }));

    expect(document.activeElement).toBe(input);
  });

  it("points the toggle at the input it controls", () => {
    render(<PasswordHarness />);

    expect(screen.getByRole("button").getAttribute("aria-controls")).toBe(
      screen.getByLabelText("Password").id,
    );
  });

  it("can turn the toggle off", () => {
    render(<PasswordHarness visibilityToggle={false} />);

    expect(screen.queryByRole("button")).toBeNull();
  });

  it("only offers the toggle for passwords", () => {
    render(<PasswordHarness type="text" />);

    expect(screen.queryByRole("button")).toBeNull();
  });

  it("takes translated toggle labels", () => {
    render(<PasswordHarness visibilityToggleLabels={{ show: "Afficher", hide: "Masquer" }} />);

    expect(screen.getByRole("button", { name: "Afficher" })).toBeTruthy();
  });
});
