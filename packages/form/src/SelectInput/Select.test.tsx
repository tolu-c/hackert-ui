// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import type { SelectData, SelectPrimitive } from "./options";
import { Select, type SelectBaseProps } from "./Select";

afterEach(cleanup);

const LIBRARIES = ["React", "Angular", "Vue", "Svelte"];

type HarnessProps<TValue extends SelectPrimitive> = SelectBaseProps<TValue> & {
  readonly mode?: "select" | "searchable" | undefined;
  readonly initial?: TValue | null | undefined;
  readonly onChange?: ((value: TValue | null) => void) | undefined;
};

function Harness<TValue extends SelectPrimitive = string>({
  initial = null,
  onChange,
  ...props
}: HarnessProps<TValue>) {
  const [value, setValue] = useState<TValue | null>(initial);

  return (
    <Select<TValue>
      aria-label="Library"
      {...props}
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
}

function combobox() {
  return screen.getByRole("combobox") as HTMLInputElement;
}

function libraries(props: Partial<HarnessProps<string>> = {}) {
  return <Harness options={LIBRARIES} {...props} />;
}

describe("Select mode=select", () => {
  it("is a read-only combobox showing the chosen label", () => {
    render(<Harness options={[{ value: "ng", label: "Angular" }]} initial="ng" />);

    expect(combobox().readOnly).toBe(true);
    expect(combobox().value).toBe("Angular");
  });

  it("opens on click and toggles closed on a second click", async () => {
    const user = userEvent.setup();
    render(libraries());

    await user.click(combobox());
    expect(screen.getByRole("listbox")).toBeTruthy();

    await user.click(combobox());
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("hands back the value in its own type", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Harness<number>
        options={[
          { value: 1, label: "One" },
          { value: 2, label: "Two" },
        ]}
        onChange={onChange}
      />,
    );

    await user.click(combobox());
    await user.click(screen.getByRole("option", { name: "Two" }));

    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("accepts boolean values", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Harness<boolean> options={[true, false]} initial={true} onChange={onChange} />);

    await user.click(combobox());
    await user.click(screen.getByRole("option", { name: "false" }));

    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("opens with Space and picks with Enter", async () => {
    const user = userEvent.setup();
    render(libraries());

    combobox().focus();
    await user.keyboard(" {ArrowDown}{Enter}");

    expect(combobox().value).toBe("Angular");
  });

  it("jumps to the next option starting with a typed letter", async () => {
    const user = userEvent.setup();
    render(libraries());

    combobox().focus();
    await user.keyboard("v{Enter}");

    expect(combobox().value).toBe("Vue");
  });

  it("does not let typing change the text", async () => {
    const user = userEvent.setup();
    render(libraries({ initial: "React" }));

    await user.type(combobox(), "zz");

    expect(combobox().value).toBe("React");
  });
});

describe("Select check icon", () => {
  async function open(props: Partial<HarnessProps<string>>) {
    render(libraries({ initial: "Vue", ...props }));
    await userEvent.setup().click(combobox());
    return screen.getByRole("option", { name: "Vue" });
  }

  it("marks the chosen option with a check on the left by default", async () => {
    const chosen = await open({});

    expect(chosen.querySelector(".hui-option-check svg")).toBeTruthy();
    expect(chosen.getAttribute("data-check-position")).toBe("left");
  });

  it("can put the check on the right", async () => {
    const chosen = await open({ checkIconPosition: "right" });

    expect(chosen.getAttribute("data-check-position")).toBe("right");
  });

  it("can drop the check", async () => {
    const chosen = await open({ withCheckIcon: false });

    expect(chosen.querySelector(".hui-option-check")).toBeNull();
  });

  it("only reserves check space on other options with aligned labels", async () => {
    await open({});
    expect(screen.getByRole("option", { name: "React" }).querySelector(".hui-option-check")).toBe(
      null,
    );
    cleanup();

    await open({ withAlignedLabels: true });
    expect(
      screen.getByRole("option", { name: "React" }).querySelector(".hui-option-check"),
    ).toBeTruthy();
  });
});

describe("Select groups", () => {
  const GROUPED: SelectData = [
    { group: "Frontend", items: ["React", "Angular"] },
    { group: "Backend", items: [{ value: "django", label: "Django" }] },
  ];

  it("renders each group with its label", async () => {
    const user = userEvent.setup();
    render(<Harness options={GROUPED} />);

    await user.click(combobox());

    expect(
      within(screen.getByRole("group", { name: "Backend" })).getByRole("option", {
        name: "Django",
      }),
    ).toBeTruthy();
  });

  it("hides groups with no matches while searching", async () => {
    const user = userEvent.setup();
    render(<Harness options={GROUPED} mode="searchable" />);

    await user.type(combobox(), "dja");

    expect(screen.queryByRole("group", { name: "Frontend" })).toBeNull();
    expect(screen.getByRole("group", { name: "Backend" })).toBeTruthy();
  });
});

describe("Select nothing found", () => {
  it("hides the dropdown when nothing matches and no message is set", async () => {
    const user = userEvent.setup();
    render(libraries({ mode: "searchable" }));

    await user.type(combobox(), "Dj");

    expect(screen.queryByRole("listbox")).toBeNull();
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("shows nothingFoundMessage when nothing matches", async () => {
    const user = userEvent.setup();
    render(libraries({ mode: "searchable", nothingFoundMessage: "Nothing found..." }));

    await user.type(combobox(), "Dj");

    expect(screen.getByRole("status").textContent).toBe("Nothing found...");
  });
});

describe("Select", () => {
  it("marks which side the dropdown opened on, for styling", async () => {
    const user = userEvent.setup();
    render(libraries());

    await user.click(combobox());

    expect(screen.getByRole("listbox").getAttribute("data-side")).toMatch(/^(top|bottom)$/);
  });

  it("follows a controlled value", () => {
    const { rerender } = render(
      <Select options={LIBRARIES} value="React" onChange={() => {}} aria-label="Library" />,
    );

    rerender(<Select options={LIBRARIES} value="Vue" onChange={() => {}} aria-label="Library" />);

    expect(combobox().value).toBe("Vue");
  });

  it("works with free text in autocomplete mode", async () => {
    const onChange = vi.fn();
    render(
      <Select
        mode="autocomplete"
        options={LIBRARIES}
        value=""
        onChange={onChange}
        aria-label="Library"
      />,
    );

    await userEvent.setup().type(combobox(), "Q");

    expect(onChange).toHaveBeenLastCalledWith("Q");
  });

  it("shows a chevron except in autocomplete mode", () => {
    const { container } = render(libraries());
    expect(container.querySelector(".hui-input-section svg")).toBeTruthy();
    cleanup();

    const free = render(
      <Select mode="autocomplete" options={LIBRARIES} value="" onChange={() => {}} />,
    );
    expect(free.container.querySelector(".hui-input-section")).toBeNull();
  });
});
