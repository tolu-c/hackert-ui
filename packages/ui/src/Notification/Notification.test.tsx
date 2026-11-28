// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { Notification } from "./Notification";
import { Notifications } from "./Notifications";
import { notifications, useNotifications, useNotify } from "./store";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  act(() => {
    notifications.clean();
    vi.runAllTimers();
  });
  vi.useRealTimers();
});

function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

describe("notifications store", () => {
  it("adds a notification and returns its id", () => {
    const { result } = renderHook(() => useNotifications());

    let id = "";
    act(() => {
      id = notifications.show({ title: "Saved", message: "Your changes are live." });
    });

    expect(result.current).toHaveLength(1);
    expect(result.current[0]).toMatchObject({ id, title: "Saved", leaving: false });
  });

  it("keeps a caller's id, and showing it again updates in place", () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      notifications.show({ id: "upload", message: "Uploading…" });
      notifications.show({ id: "upload", message: "Uploaded" });
    });

    expect(result.current).toHaveLength(1);
    expect(result.current[0]?.message).toBe("Uploaded");
  });

  it("merges an update into the notification", () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      const id = notifications.show({ title: "Upload", message: "Uploading…", loading: true });
      notifications.update(id, { message: "Done", loading: false });
    });

    expect(result.current[0]).toMatchObject({ title: "Upload", message: "Done", loading: false });
  });

  it("marks a hidden notification as leaving, then removes it", () => {
    const onClose = vi.fn();
    const { result } = renderHook(() => useNotifications());
    let id = "";
    act(() => {
      id = notifications.show({ message: "Bye", onClose });
    });

    act(() => notifications.hide(id));
    expect(result.current[0]?.leaving).toBe(true);
    expect(onClose).toHaveBeenCalledWith(id);

    advance(200);
    expect(result.current).toHaveLength(0);
  });

  it("hides everything on clean", () => {
    const { result } = renderHook(() => useNotifications());
    act(() => {
      notifications.show({ message: "One" });
      notifications.show({ message: "Two" });
      notifications.clean();
    });

    advance(200);

    expect(result.current).toHaveLength(0);
  });

  it("is also reachable through useNotify", () => {
    const { result } = renderHook(() => useNotify());

    expect(result.current).toBe(notifications);
  });
});

describe("Notifications", () => {
  it("renders shown notifications into the document body", () => {
    render(<Notifications />);

    act(() => {
      notifications.show({ title: "Saved", message: "Your changes are live." });
    });

    expect(screen.getByText("Saved")).toBeTruthy();
    expect(screen.getByText("Your changes are live.")).toBeTruthy();
    expect(screen.getByRole("region", { name: "Notifications" }).parentElement).toBe(document.body);
  });

  it("closes a notification on its own after autoClose", () => {
    render(<Notifications />);
    act(() => {
      notifications.show({ message: "Brief", autoClose: 1000 });
    });

    advance(1000 + 200);

    expect(screen.queryByText("Brief")).toBeNull();
  });

  it("resumes auto-closing after the focused notification closes", () => {
    render(<Notifications />);
    act(() => {
      notifications.show({ message: "First", autoClose: false });
    });
    const close = screen.getByRole("button");
    act(() => close.focus());
    fireEvent.click(close);
    advance(200);
    expect(screen.queryByText("First")).toBeNull();

    act(() => {
      notifications.show({ message: "Second", autoClose: 1000 });
    });
    advance(1000 + 200);

    expect(screen.queryByText("Second")).toBeNull();
  });

  it("waits four seconds by default", () => {
    render(<Notifications />);
    act(() => {
      notifications.show({ message: "Default" });
    });

    advance(3900);
    expect(screen.getByText("Default")).toBeTruthy();

    advance(100 + 200);
    expect(screen.queryByText("Default")).toBeNull();
  });

  it("stays until dismissed when autoClose is false", () => {
    render(<Notifications />);
    act(() => {
      notifications.show({ message: "Sticky", autoClose: false });
    });

    advance(60_000);

    expect(screen.getByText("Sticky")).toBeTruthy();
  });

  it("does not close while loading", () => {
    render(<Notifications />);
    act(() => {
      notifications.show({ message: "Working", loading: true, autoClose: 1000 });
    });

    advance(5000);

    expect(screen.getByText("Working")).toBeTruthy();
  });

  it("pauses its timer while the pointer is over the stack", () => {
    render(<Notifications />);
    act(() => {
      notifications.show({ message: "Hover me", autoClose: 1000 });
    });
    advance(600);

    fireEvent.pointerEnter(screen.getByRole("list"));
    advance(5000);
    expect(screen.getByText("Hover me")).toBeTruthy();

    fireEvent.pointerLeave(screen.getByRole("list"));
    advance(400 + 200);
    expect(screen.queryByText("Hover me")).toBeNull();
  });

  it("restarts the timer when the notification is updated", () => {
    render(<Notifications />);
    let id = "";
    act(() => {
      id = notifications.show({ message: "First", autoClose: 1000 });
    });
    advance(800);

    act(() => notifications.update(id, { message: "Second" }));
    advance(800);

    expect(screen.getByText("Second")).toBeTruthy();
  });

  it("queues notifications beyond the limit", () => {
    render(<Notifications limit={2} />);
    let first = "";
    act(() => {
      first = notifications.show({ message: "One", autoClose: false });
      notifications.show({ message: "Two", autoClose: false });
      notifications.show({ message: "Three", autoClose: false });
    });
    expect(screen.queryByText("Three")).toBeNull();

    act(() => notifications.hide(first));
    advance(200);

    expect(screen.getByText("Three")).toBeTruthy();
  });

  it("dismisses from the close button", () => {
    render(<Notifications />);
    act(() => {
      notifications.show({ message: "Closable", autoClose: false });
    });

    fireEvent.click(screen.getByRole("button", { name: "Close notification" }));
    advance(200);

    expect(screen.queryByText("Closable")).toBeNull();
  });

  it("places the stack at its position", () => {
    render(<Notifications position="top-center" />);

    expect(screen.getByRole("region", { name: "Notifications" }).dataset.position).toBe(
      "top-center",
    );
  });
});

describe("Notification", () => {
  it("shows a title and message", () => {
    render(<Notification title="Saved">Your changes are live.</Notification>);

    expect(screen.getByText("Saved")).toBeTruthy();
    expect(screen.getByText("Your changes are live.")).toBeTruthy();
  });

  it("calls onClose from its close button", () => {
    const onClose = vi.fn();
    render(<Notification onClose={onClose}>Message</Notification>);

    fireEvent.click(screen.getByRole("button", { name: "Close notification" }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("can drop its close button", () => {
    render(<Notification withCloseButton={false}>Message</Notification>);

    expect(screen.queryByRole("button")).toBeNull();
  });

  it("shows a loader in place of the icon while loading", () => {
    render(
      <Notification loading icon={<span>!</span>}>
        Message
      </Notification>,
    );

    expect(document.querySelector(".hui-notification .hui-loader")).not.toBeNull();
    expect(screen.queryByText("!")).toBeNull();
  });

  it("shows an icon", () => {
    render(<Notification icon={<span>!</span>}>Message</Notification>);

    expect(screen.getByText("!").closest(".hui-notification-icon")).not.toBeNull();
  });

  it("paints its accent from a theme key or CSS colour", () => {
    render(<Notification color="tomato">Message</Notification>);

    expect(
      document
        .querySelector<HTMLElement>(".hui-notification")
        ?.style.getPropertyValue("--hui-accent"),
    ).toBe("tomato");
  });
});
