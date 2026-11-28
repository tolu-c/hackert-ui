// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { type ReactNode, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { Modal, type ModalProps } from "./Modal";

afterEach(cleanup);

function dialog() {
  const element = document.querySelector("dialog");
  if (!element) throw new Error("no dialog rendered");
  return element;
}

function Controlled(props: Partial<ModalProps> & { readonly children?: ReactNode }) {
  return (
    <Modal opened onClose={() => {}} title="Delete page" {...props}>
      {props.children ?? "Are you sure?"}
    </Modal>
  );
}

describe("Modal", () => {
  it("renders a closed dialog with no content when not opened", () => {
    render(
      <Modal opened={false} onClose={() => {}} title="Delete page">
        Are you sure?
      </Modal>,
    );

    expect(dialog().open).toBe(false);
    expect(screen.queryByText("Are you sure?")).toBeNull();
  });

  it("opens as a modal dialog named by its title", () => {
    render(<Controlled />);

    expect(dialog().open).toBe(true);
    expect(screen.getByRole("dialog", { name: "Delete page" })).toBe(dialog());
    expect(screen.getByText("Are you sure?")).toBeTruthy();
  });

  it("is described by its description", () => {
    render(<Controlled description="This cannot be undone." />);

    expect(screen.getByRole("dialog").getAttribute("aria-describedby")).toBe(
      screen.getByText("This cannot be undone.").id,
    );
  });

  it("calls onClose from its close button", () => {
    const onClose = vi.fn();
    render(<Controlled onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("passes closeButtonProps to the close button", () => {
    render(<Controlled closeButtonProps={{ "aria-label": "Dismiss" }} />);

    expect(screen.getByRole("button", { name: "Dismiss" })).toBeTruthy();
  });

  it("asks to close on Escape instead of closing itself", () => {
    const onClose = vi.fn();
    render(<Controlled onClose={onClose} />);
    const cancel = new Event("cancel", { cancelable: true });

    fireEvent(dialog(), cancel);

    expect(onClose).toHaveBeenCalledOnce();
    expect(cancel.defaultPrevented).toBe(true);
  });

  it("ignores Escape when closeOnEscape is false", () => {
    const onClose = vi.fn();
    render(<Controlled onClose={onClose} closeOnEscape={false} />);

    fireEvent(dialog(), new Event("cancel", { cancelable: true }));

    expect(onClose).not.toHaveBeenCalled();
  });

  it("closes on a click on the backdrop but not inside the content", () => {
    const onClose = vi.fn();
    render(<Controlled onClose={onClose} />);

    fireEvent.pointerDown(screen.getByText("Are you sure?"));
    fireEvent.click(screen.getByText("Are you sure?"));
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.pointerDown(dialog());
    fireEvent.click(dialog());
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("does not close when a drag that began inside ends on the backdrop", () => {
    const onClose = vi.fn();
    render(<Controlled onClose={onClose} />);

    fireEvent.pointerDown(screen.getByText("Are you sure?"));
    fireEvent.click(dialog());

    expect(onClose).not.toHaveBeenCalled();
  });

  it("ignores backdrop clicks when closeOnClickOutside is false", () => {
    const onClose = vi.fn();
    render(<Controlled onClose={onClose} closeOnClickOutside={false} />);

    fireEvent.pointerDown(dialog());
    fireEvent.click(dialog());

    expect(onClose).not.toHaveBeenCalled();
  });

  it("reports a close the browser forced while still opened", () => {
    const onClose = vi.fn();
    render(<Controlled onClose={onClose} />);

    act(() => dialog().close());

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("ignores a forced close when closeOnEscape is false, and reopens", () => {
    const onClose = vi.fn();
    render(<Controlled onClose={onClose} closeOnEscape={false} />);

    act(() => dialog().close());

    expect(onClose).not.toHaveBeenCalled();
    expect(dialog().open).toBe(true);
  });

  it("reopens after a forced close the owner leaves opened", () => {
    render(<Controlled />);

    act(() => dialog().close());

    expect(dialog().open).toBe(true);
  });

  it("drops the header without a close button or title", () => {
    render(<Controlled title={undefined} aria-label="Confirm" withCloseButton={false} />);

    expect(dialog().querySelector(".hui-modal-header")).toBeNull();
    expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
  });

  it("keeps a title without its close button", () => {
    render(<Controlled withCloseButton={false} />);

    expect(screen.getByRole("dialog", { name: "Delete page" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
  });

  it.each([
    ["lg", "620px"],
    ["xs", "320px"],
    ["70%", "70%"],
    [500, "500px"],
  ] as const)("sizes %s to a width of %s", (size, width) => {
    render(<Controlled size={size} />);

    expect(dialog().style.getPropertyValue("--hui-modal-width")).toBe(width);
  });

  it("defaults to the lg size", () => {
    render(<Controlled />);

    expect(dialog().style.getPropertyValue("--hui-modal-width")).toBe("620px");
  });

  it("fits its content with size auto", () => {
    render(<Controlled size="auto" />);

    expect(dialog().dataset.size).toBe("auto");
  });

  it("sits near the top unless centred", () => {
    const { rerender } = render(<Controlled />);
    expect(dialog().hasAttribute("data-centered")).toBe(false);

    rerender(<Controlled centered />);
    expect(dialog().hasAttribute("data-centered")).toBe(true);
  });

  it("locks page scroll while open and restores it after", () => {
    document.body.style.overflow = "scroll";
    const { rerender } = render(<Controlled />);
    expect(document.body.style.overflow).toBe("hidden");

    rerender(<Controlled opened={false} />);
    expect(document.body.style.overflow).toBe("scroll");
    document.body.style.overflow = "";
  });

  it("keeps the page locked until the last open modal closes", () => {
    function Two({ first, second }: { readonly first: boolean; readonly second: boolean }) {
      return (
        <>
          <Modal opened={first} onClose={() => {}} title="One">
            1
          </Modal>
          <Modal opened={second} onClose={() => {}} title="Two">
            2
          </Modal>
        </>
      );
    }
    const { rerender } = render(<Two first second />);

    rerender(<Two first={false} second />);
    expect(document.body.style.overflow).toBe("hidden");

    rerender(<Two first={false} second={false} />);
    expect(document.body.style.overflow).toBe("");
  });

  it("unmounts its content once the exit transition has had time to run", async () => {
    const { rerender } = render(<Controlled />);

    rerender(<Controlled opened={false} />);
    expect(dialog().open).toBe(false);

    await waitFor(() => expect(screen.queryByText("Are you sure?")).toBeNull());
  });

  it("adds one shared stylesheet however many modals render", () => {
    render(
      <>
        <Controlled />
        <Controlled />
      </>,
    );

    expect(document.head.querySelectorAll('style[data-href="hui-modal"]')).toHaveLength(1);
  });
});

describe("Modal compound parts", () => {
  it("composes a dialog from its parts", () => {
    const onClose = vi.fn();
    render(
      <Modal.Root opened onClose={onClose}>
        <Modal.Header>
          <Modal.Title>Settings</Modal.Title>
          <Modal.CloseButton />
        </Modal.Header>
        <Modal.Body>Body</Modal.Body>
      </Modal.Root>,
    );

    expect(screen.getByRole("dialog", { name: "Settings" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("names parts used outside a Modal.Root in the error", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<Modal.Title>Lost</Modal.Title>)).toThrow(
      "Modal.Title must be rendered inside <Modal.Root> or <Modal>",
    );
    vi.mocked(console.error).mockRestore();
  });
});

describe("Modal.Stack", () => {
  function Stack() {
    const [opened, setOpened] = useState<readonly string[]>([]);
    const props = (id: string) => ({
      opened: opened.includes(id),
      onClose: () => setOpened((current) => current.filter((value) => value !== id)),
      stackId: id,
      title: id,
    });

    return (
      <>
        <Modal.Stack>
          <Modal {...props("first")}>First</Modal>
          <Modal {...props("second")}>Second</Modal>
        </Modal.Stack>
        <button type="button" onClick={() => setOpened((current) => [...current, "first"])}>
          open first
        </button>
        <button type="button" onClick={() => setOpened((current) => [...current, "second"])}>
          open second
        </button>
      </>
    );
  }

  function stacked(name: string) {
    return screen
      .getAllByRole("dialog", { hidden: true })
      .find((element) => element.textContent?.includes(name)) as HTMLDialogElement;
  }

  it("shows only the most recently opened modal", () => {
    render(<Stack />);

    fireEvent.click(screen.getByText("open first", { selector: "button" }));
    fireEvent.click(screen.getByText("open second", { selector: "button" }));

    expect(stacked("First").hasAttribute("data-stack-hidden")).toBe(true);
    expect(stacked("Second").hasAttribute("data-stack-hidden")).toBe(false);
  });

  it("reveals the modal underneath when the top one closes", () => {
    render(<Stack />);
    fireEvent.click(screen.getByText("open first", { selector: "button" }));
    fireEvent.click(screen.getByText("open second", { selector: "button" }));

    fireEvent(stacked("Second"), new Event("cancel", { cancelable: true }));

    expect(stacked("First").hasAttribute("data-stack-hidden")).toBe(false);
    expect(stacked("First").open).toBe(true);
  });
});
