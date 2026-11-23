// @vitest-environment jsdom

import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vite-plus/test";

import { useAppForm } from "../form-hook";
import type { NumberInputProps } from "./NumberInput";

afterEach(cleanup);

let latest: number | null | undefined;
let reset: () => void = () => {};

function Harness({ initial = null, ...props }: NumberInputProps & { initial?: number | null }) {
  const form = useAppForm({ defaultValues: { amount: initial as number | null } });
  reset = () => form.setFieldValue("amount", 42);

  return (
    <form.AppField name="amount">
      {(field) => {
        latest = field.state.value;
        return <field.NumberInput aria-label="Amount" {...props} />;
      }}
    </form.AppField>
  );
}

function input() {
  return screen.getByLabelText("Amount") as HTMLInputElement;
}

describe("NumberInput", () => {
  it("renders a NaN value as empty without looping", () => {
    render(<Harness initial={Number.NaN} />);

    expect(input().value).toBe("");
  });

  it("formats currency as the user types and stores a number", async () => {
    render(<Harness currency="NGN" locale="en-NG" />);

    await userEvent.setup().type(input(), "1234567.891");

    expect(input().value).toBe("1,234,567.89");
    expect(latest).toBe(1234567.89);
  });

  it("shows the currency symbol as a separate affix, not as typed text", () => {
    render(<Harness currency="NGN" locale="en-NG" />);

    expect(screen.getByText("₦")).toBeTruthy();
    expect(input().value).toBe("");
  });

  it("stores null when empty and ignores letters", async () => {
    render(<Harness />);

    await userEvent.setup().type(input(), "ab");

    expect(input().value).toBe("");
    expect(latest).toBeNull();
  });

  it("accepts negatives unless disallowed", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Harness />);
    await user.type(input(), "-5");
    expect(latest).toBe(-5);
    unmount();

    render(<Harness allowNegative={false} />);
    await user.type(input(), "-5");
    expect(latest).toBe(5);
  });

  it("keeps the caret on the same digit when typing in the middle", async () => {
    const user = userEvent.setup();
    render(<Harness currency="USD" initial={12345} />);

    await user.click(input());
    input().setSelectionRange(3, 3);
    await user.keyboard("9");

    expect(input().value).toBe("129,345.00");
    expect(input().selectionStart).toBe(3);
  });

  it("follows the form when the value is changed from outside", () => {
    render(<Harness currency="USD" initial={1} />);

    act(() => reset());

    expect(input().value).toBe("42.00");
  });

  it("pads currency decimals on blur", async () => {
    const user = userEvent.setup();
    render(<Harness currency="USD" />);

    await user.type(input(), "12.5");
    await user.tab();

    expect(input().value).toBe("12.50");
  });

  it("shows the initial value formatted", () => {
    render(<Harness currency="USD" initial={1234.5} />);

    expect(input().value).toBe("1,234.50");
  });

  it("keeps a partial decimal while typing", async () => {
    render(<Harness />);

    await userEvent.setup().type(input(), "12.");

    expect(input().value).toBe("12.");
    expect(latest).toBe(12);
  });

  it("drops a trailing decimal separator on blur", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(input(), "12.");
    await user.tab();

    expect(input().value).toBe("12");
  });

  it("limits typing to the decimals prop", async () => {
    render(<Harness decimals={1} />);

    await userEvent.setup().type(input(), "1.25");

    expect(input().value).toBe("1.2");
    expect(latest).toBe(1.2);
  });

  it("accepts zero", async () => {
    render(<Harness />);

    await userEvent.setup().type(input(), "0");

    expect(input().value).toBe("0");
    expect(latest).toBe(0);
  });

  it("keeps a lone minus while typing a negative", async () => {
    render(<Harness currency="USD" />);

    await userEvent.setup().type(input(), "-");

    expect(input().value).toBe("-");
    expect(latest).toBeNull();
  });

  it("cleans pasted text", async () => {
    const user = userEvent.setup();
    render(<Harness currency="USD" />);

    await user.click(input());
    await user.paste("$1,234.567 USD");

    expect(input().value).toBe("1,234.56");
    expect(latest).toBe(1234.56);
  });

  it("uses the locale's separators", async () => {
    const user = userEvent.setup();
    render(<Harness currency="EUR" locale="de-DE" />);

    await user.type(input(), "1234,5");
    expect(input().value).toBe("1.234,5");
    expect(latest).toBe(1234.5);

    await user.tab();
    expect(input().value).toBe("1.234,50");
  });

  it("keeps the caret on the same digit when deleting across a separator", async () => {
    const user = userEvent.setup();
    render(<Harness thousandSeparator initial={123456} />);

    await user.click(input());
    input().setSelectionRange(5, 5);
    await user.keyboard("{Backspace}");

    expect(input().value).toBe("12,356");
    expect(input().selectionStart).toBe(4);
  });

  it("stores null when cleared", async () => {
    render(<Harness currency="USD" initial={5} />);

    await userEvent.setup().clear(input());

    expect(input().value).toBe("");
    expect(latest).toBeNull();
  });

  it("rounds an outside value with too many decimals", () => {
    render(<Harness currency="USD" initial={0.1 + 0.2} />);

    expect(input().value).toBe("0.30");
  });

  it("renders no affix without a currency", () => {
    const { container } = render(<Harness />);

    expect(container.querySelector(".hui-input-section")).toBeNull();
  });

  it("puts the currency symbol inside the input, before the number in en-NG", () => {
    render(<Harness currency="NGN" locale="en-NG" />);

    expect(screen.getByText("₦").closest("[data-position]")?.getAttribute("data-position")).toBe(
      "left",
    );
  });

  it("puts the currency symbol after the number where the locale does", () => {
    render(<Harness currency="EUR" locale="de-DE" />);

    expect(screen.getByText("€").closest("[data-position]")?.getAttribute("data-position")).toBe(
      "right",
    );
  });

  it("is a decimal text input", () => {
    render(<Harness />);

    expect(input().type).toBe("text");
    expect(input().inputMode).toBe("decimal");
  });
});
