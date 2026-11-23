// @vitest-environment jsdom

import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vite-plus/test";

import { useAppForm } from "../form-hook";
import type { SelectInputProps } from "./SelectInput";

afterEach(cleanup);

const OPTIONS = [
  { value: "ng", label: "Nigeria" },
  { value: "gh", label: "Ghana" },
  { value: "ke", label: "Kenya", disabled: true },
  { value: "za", label: "South Africa" },
];

let latest = "";
let reset: () => void = () => {};

function Harness({ initial = "", ...props }: Partial<SelectInputProps> & { initial?: string }) {
  const form = useAppForm({ defaultValues: { country: initial } });
  reset = () => form.setFieldValue("country", "gh");

  return (
    <form.AppField name="country">
      {(field) => {
        latest = field.state.value;
        return <field.SelectInput aria-label="Country" options={OPTIONS} {...props} />;
      }}
    </form.AppField>
  );
}

describe("SelectInput mode=select", () => {
  it("renders a native select with a disabled placeholder", () => {
    render(<Harness placeholder="Pick one" />);

    const select = screen.getByLabelText("Country") as HTMLSelectElement;

    expect(select.tagName).toBe("SELECT");
    expect(select.value).toBe("");
    expect((screen.getByRole("option", { name: "Pick one" }) as HTMLOptionElement).disabled).toBe(
      true,
    );
  });

  it("writes the chosen option to the field", async () => {
    render(<Harness />);

    await userEvent.setup().selectOptions(screen.getByLabelText("Country"), "gh");

    expect(latest).toBe("gh");
  });

  it("disables disabled options", () => {
    render(<Harness />);

    expect((screen.getByRole("option", { name: "Kenya" }) as HTMLOptionElement).disabled).toBe(
      true,
    );
  });
});

describe("SelectInput mode=searchable", () => {
  function combobox() {
    return screen.getByRole("combobox") as HTMLInputElement;
  }

  it("exposes the combobox ARIA contract", async () => {
    const user = userEvent.setup();
    render(<Harness mode="searchable" />);

    expect(combobox().getAttribute("aria-expanded")).toBe("false");
    expect(combobox().getAttribute("aria-autocomplete")).toBe("list");

    await user.click(combobox());

    expect(combobox().getAttribute("aria-expanded")).toBe("true");
    expect(combobox().getAttribute("aria-controls")).toBe(screen.getByRole("listbox").id);
    expect(screen.getAllByRole("option")).toHaveLength(4);
  });

  it("filters while typing and selects with Enter", async () => {
    const user = userEvent.setup();
    render(<Harness mode="searchable" />);

    await user.type(combobox(), "gha{Enter}");

    expect(latest).toBe("gh");
    expect(combobox().value).toBe("Ghana");
    expect(combobox().getAttribute("aria-expanded")).toBe("false");
  });

  it("moves the active option with the arrows, skipping disabled ones", async () => {
    const user = userEvent.setup();
    render(<Harness mode="searchable" />);

    await user.click(combobox());
    await user.keyboard("{ArrowDown}");
    expect(combobox().getAttribute("aria-activedescendant")).toBe(
      screen.getByRole("option", { name: "Ghana" }).id,
    );

    await user.keyboard("{ArrowDown}");
    expect(combobox().getAttribute("aria-activedescendant")).toBe(
      screen.getByRole("option", { name: "South Africa" }).id,
    );

    await user.keyboard("{Home}");
    expect(screen.getByRole("option", { name: "Nigeria" }).getAttribute("aria-selected")).toBe(
      "true",
    );
    expect(combobox().getAttribute("aria-activedescendant")).toBe(
      screen.getByRole("option", { name: "Nigeria" }).id,
    );

    await user.keyboard("{End}");
    expect(combobox().getAttribute("aria-activedescendant")).toBe(
      screen.getByRole("option", { name: "South Africa" }).id,
    );
  });

  it("opens with ArrowDown when closed", async () => {
    const user = userEvent.setup();
    render(<Harness mode="searchable" />);

    await user.tab();
    await user.keyboard("{ArrowDown}");

    expect(combobox().getAttribute("aria-expanded")).toBe("true");
  });

  it("closes on the first Escape and clears on the second", async () => {
    const user = userEvent.setup();
    render(<Harness mode="searchable" initial="ng" />);

    await user.click(combobox());
    await user.keyboard("{Escape}");
    expect(combobox().getAttribute("aria-expanded")).toBe("false");
    expect(combobox().value).toBe("Nigeria");

    await user.keyboard("{Escape}");
    expect(combobox().value).toBe("");
    expect(latest).toBe("");
  });

  it("selects an option by mouse without losing focus", async () => {
    const user = userEvent.setup();
    render(<Harness mode="searchable" />);

    await user.click(combobox());
    await user.click(screen.getByRole("option", { name: "South Africa" }));

    expect(latest).toBe("za");
    expect(document.activeElement).toBe(combobox());
  });

  it("does not select a disabled option", async () => {
    const user = userEvent.setup();
    render(<Harness mode="searchable" />);

    await user.click(combobox());
    await user.click(screen.getByRole("option", { name: "Kenya" }));

    expect(latest).toBe("");
  });

  it("goes back to the selected label on blur when the text is not an option", async () => {
    const user = userEvent.setup();
    render(<Harness mode="searchable" initial="ng" />);

    await user.type(combobox(), "xyz");
    await user.tab();

    expect(combobox().value).toBe("Nigeria");
    expect(latest).toBe("ng");
  });

  it("shows a message when nothing matches", async () => {
    const user = userEvent.setup();
    render(<Harness mode="searchable" />);

    await user.type(combobox(), "zzz");

    expect(screen.getByText("No results")).toBeTruthy();
    expect(screen.queryByRole("option")).toBeNull();
  });

  it("moves up with ArrowUp, skipping disabled options", async () => {
    const user = userEvent.setup();
    render(<Harness mode="searchable" />);

    await user.click(combobox());
    await user.keyboard("{End}{ArrowUp}");

    expect(combobox().getAttribute("aria-activedescendant")).toBe(
      screen.getByRole("option", { name: "Ghana" }).id,
    );
  });

  it("opens with ArrowUp when closed", async () => {
    const user = userEvent.setup();
    render(<Harness mode="searchable" />);

    await user.tab();
    await user.keyboard("{ArrowUp}");

    expect(combobox().getAttribute("aria-expanded")).toBe("true");
  });

  it("highlights the selected option when opened", async () => {
    const user = userEvent.setup();
    render(<Harness mode="searchable" initial="za" />);

    await user.click(combobox());

    expect(combobox().getAttribute("aria-activedescendant")).toBe(
      screen.getByRole("option", { name: "South Africa" }).id,
    );
  });

  it("closes the list on Tab", async () => {
    const user = userEvent.setup();
    render(<Harness mode="searchable" />);

    await user.click(combobox());
    await user.tab();

    expect(combobox().getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("closes the list after a mouse selection", async () => {
    const user = userEvent.setup();
    render(<Harness mode="searchable" />);

    await user.click(combobox());
    await user.click(screen.getByRole("option", { name: "Ghana" }));

    expect(screen.queryByRole("listbox")).toBeNull();
    expect(combobox().value).toBe("Ghana");
  });

  it("filters ignoring case and accents", async () => {
    const user = userEvent.setup();
    const options = [...OPTIONS, { value: "ci", label: "Côte d'Ivoire" }];
    render(<Harness mode="searchable" options={options} />);

    await user.type(combobox(), "COTE");

    expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual([
      "Côte d'Ivoire",
    ]);
  });

  it("does not change the value while the user is only typing", async () => {
    const user = userEvent.setup();
    render(<Harness mode="searchable" initial="ng" />);

    await user.type(combobox(), "gh");

    expect(latest).toBe("ng");
  });

  it("clears the value when the text is cleared", async () => {
    const user = userEvent.setup();
    render(<Harness mode="searchable" initial="ng" />);

    await user.clear(combobox());

    expect(latest).toBe("");
  });

  it("does not pick a disabled match with Enter", async () => {
    const user = userEvent.setup();
    render(<Harness mode="searchable" />);

    await user.type(combobox(), "keny{Enter}");

    expect(latest).toBe("");
    expect(combobox().hasAttribute("aria-activedescendant")).toBe(false);
  });

  it("uses a custom empty message", async () => {
    const user = userEvent.setup();
    render(<Harness mode="searchable" emptyMessage="Nothing here" />);

    await user.type(combobox(), "zzz");

    expect(screen.getByRole("status").textContent).toBe("Nothing here");
  });

  it("follows the form when the value is changed from outside", () => {
    render(<Harness mode="searchable" initial="ng" />);

    act(() => reset());

    expect(combobox().value).toBe("Ghana");
  });

  it("flags the open state for styling", async () => {
    const user = userEvent.setup();
    render(<Harness mode="searchable" />);

    expect(combobox().getAttribute("data-state")).toBe("closed");
    await user.click(combobox());
    expect(combobox().getAttribute("data-state")).toBe("open");
  });
});

describe("SelectInput mode=autocomplete", () => {
  it("keeps whatever was typed as the value", async () => {
    const user = userEvent.setup();
    render(<Harness mode="autocomplete" />);

    await user.type(screen.getByRole("combobox"), "Atlantis");
    await user.tab();

    expect(latest).toBe("Atlantis");
    expect((screen.getByRole("combobox") as HTMLInputElement).value).toBe("Atlantis");
  });

  it("offers matches as suggestions and fills in the picked label", async () => {
    const user = userEvent.setup();
    render(<Harness mode="autocomplete" />);

    await user.type(screen.getByRole("combobox"), "gha");
    await user.click(screen.getByRole("option", { name: "Ghana" }));

    expect(latest).toBe("Ghana");
  });

  it("lets Enter through when no suggestion is active", async () => {
    const user = userEvent.setup();
    render(<Harness mode="autocomplete" />);

    await user.type(screen.getByRole("combobox"), "gha{Enter}");

    expect(latest).toBe("gha");
  });

  it("picks a suggestion with the keyboard and stores its label", async () => {
    const user = userEvent.setup();
    render(<Harness mode="autocomplete" />);

    await user.type(screen.getByRole("combobox"), "a{ArrowDown}{Enter}");

    expect(latest).toBe("Nigeria");
  });

  it("shows no empty message when nothing matches", async () => {
    const user = userEvent.setup();
    render(<Harness mode="autocomplete" />);

    await user.type(screen.getByRole("combobox"), "zzz");

    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("only points aria-controls at a listbox that is rendered", async () => {
    const user = userEvent.setup();
    render(<Harness mode="autocomplete" />);

    await user.type(screen.getByRole("combobox"), "zzz");

    expect(screen.getByRole("combobox").getAttribute("aria-controls")).toBeNull();
  });

  it("highlights the chosen suggestion when reopened", async () => {
    const user = userEvent.setup();
    render(<Harness mode="autocomplete" initial="Ghana" />);

    await user.click(screen.getByRole("combobox"));
    const active = screen.getByRole("combobox").getAttribute("aria-activedescendant");

    expect(active && document.getElementById(active)?.textContent).toBe("Ghana");
  });

  it("closes on the first Escape and clears the free text on the second", async () => {
    const user = userEvent.setup();
    render(<Harness mode="autocomplete" />);

    await user.type(screen.getByRole("combobox"), "Atl{Escape}");
    expect(latest).toBe("Atl");

    await user.keyboard("{Escape}");
    expect(latest).toBe("");
  });
});
