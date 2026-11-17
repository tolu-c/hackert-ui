// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { routeTree } from "../routeTree.gen";

vi.mock("@tanstack/react-devtools", () => ({ TanStackDevtools: () => null }));
vi.mock("@tanstack/react-router-devtools", () => ({ TanStackRouterDevtoolsPanel: () => null }));

afterEach(cleanup);

async function renderAt(url: string) {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [url] }),
  });
  await router.load();
  return render(<RouterProvider router={router} />);
}

describe("configurator pages", () => {
  it.each(["/ui/button", "/ui/card", "/form/input"])(
    "render when the URL carries a numeric param no control declares: %s",
    async (path) => {
      await renderAt(`${path}?page=2`);

      expect(await screen.findByText("Usage")).toBeTruthy();
    },
  );

  it("does not pass undeclared params to the component", async () => {
    const { container } = await renderAt("/ui/button?utm_source=newsletter");
    await screen.findByText("Usage");

    expect(container.querySelector("[utm_source]")).toBeNull();
  });
});
