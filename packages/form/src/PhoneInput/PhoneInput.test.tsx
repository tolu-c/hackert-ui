// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { CountryCode } from "libphonenumber-js";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { useAppForm } from "../form-hook";

afterEach(cleanup);

interface HarnessProps {
  readonly initial?: string;
  readonly defaultCountry?: CountryCode;
  readonly countries?: readonly CountryCode[];
  readonly onChange?: (value: string) => void;
}

function Harness({ initial = "", defaultCountry, countries, onChange }: HarnessProps) {
  const form = useAppForm({ defaultValues: { phone: initial } });

  return (
    <form.AppField name="phone" listeners={{ onChange: ({ value }) => onChange?.(value) }}>
      {(field) => (
        <field.PhoneInput
          aria-label="Phone"
          {...(defaultCountry ? { defaultCountry } : {})}
          {...(countries ? { countries } : {})}
        />
      )}
    </form.AppField>
  );
}

function phone() {
  return screen.getByLabelText("Phone") as HTMLInputElement;
}

function trigger() {
  return screen.getByRole("button", { name: /^Country:/ });
}

describe("PhoneInput", () => {
  it("starts on the default country", () => {
    render(<Harness defaultCountry="NG" />);

    expect(trigger().getAttribute("aria-label")).toBe("Country: Nigeria +234");
    expect(trigger().textContent).toContain("+234");
  });

  it("defaults to the United States", () => {
    render(<Harness />);

    expect(trigger().getAttribute("aria-label")).toBe("Country: United States +1");
  });

  it("formats the number as it is typed and stores it in E.164", async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    await userEvent.setup().type(phone(), "2025550123");

    expect(phone().value).toBe("(202) 555-0123");
    expect(onChange).toHaveBeenLastCalledWith("+12025550123");
  });

  it("stores an empty string when the field is cleared", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Harness onChange={onChange} />);

    await user.type(phone(), "20");
    await user.clear(phone());

    expect(onChange).toHaveBeenLastCalledWith("");
  });

  it("deletes the digit before a formatting character on backspace", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(phone(), "202");
    expect(phone().value).toBe("(202)");

    await user.type(phone(), "{Backspace}");

    expect(phone().value).toBe("20");
  });

  it("deletes the digit after a formatting character on forward delete", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(phone(), "2025550123");
    phone().setSelectionRange(4, 4);
    await user.keyboard("{Delete}");

    expect(phone().value).toBe("(202) 550-123");
  });

  it("shows a stored number in its country's national format", () => {
    render(<Harness initial="+442079460000" />);

    expect(trigger().getAttribute("aria-label")).toBe("Country: United Kingdom +44");
    expect(phone().value).toBe("020 7946 0000");
  });

  it("switches country when an international number is typed", async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    await userEvent.setup().type(phone(), "+442079460000");

    expect(trigger().getAttribute("aria-label")).toBe("Country: United Kingdom +44");
    expect(onChange).toHaveBeenLastCalledWith("+442079460000");
  });

  it("opens a searchable country list from the trigger", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(trigger());
    const search = screen.getByRole("combobox", { name: "Search countries" });
    expect(document.activeElement).toBe(search);

    await user.type(search, "germ");

    const options = within(screen.getByRole("listbox")).getAllByRole("option");
    expect(options.map((option) => option.textContent)).toEqual(["🇩🇪Germany+49"]);
  });

  it("finds a country by its dialling code", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(trigger());
    await user.type(screen.getByRole("combobox", { name: "Search countries" }), "+234");

    expect(screen.getByRole("option", { name: /Nigeria/ })).toBeTruthy();
  });

  it("picks a country with the keyboard and keeps the national digits", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Harness onChange={onChange} />);
    await user.type(phone(), "8031234567");

    await user.click(trigger());
    await user.type(screen.getByRole("combobox", { name: "Search countries" }), "nigeria{Enter}");

    expect(screen.queryByRole("listbox")).toBeNull();
    expect(trigger().getAttribute("aria-label")).toBe("Country: Nigeria +234");
    expect(document.activeElement).toBe(phone());
    expect(onChange).toHaveBeenLastCalledWith("+2348031234567");
  });

  it("closes the list on Escape and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(trigger());
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("listbox")).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });

  it("limits the list to the given countries", async () => {
    const user = userEvent.setup();
    render(<Harness defaultCountry="GB" countries={["GB", "IE", "FR"]} />);

    await user.click(trigger());

    expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual([
      "🇫🇷France+33",
      "🇮🇪Ireland+353",
      "🇬🇧United Kingdom+44",
    ]);
  });

  it("closes the list when focus leaves the search box", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(trigger());
    await user.click(phone());

    expect(screen.queryByRole("listbox")).toBeNull();
  });
});
