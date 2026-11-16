// @vitest-environment jsdom

import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vite-plus/test";

import { SECTIONS } from "@/catalog";
import { SectionLayout } from "./SectionLayout";

afterEach(cleanup);

function renderAt(path: string) {
  const rootRoute = createRootRoute();
  const sectionRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/ui",
    component: () => <SectionLayout section={SECTIONS.ui} />,
  });
  const pages = SECTIONS.ui.items.map((item) =>
    createRoute({
      getParentRoute: () => sectionRoute,
      path: item.to.replace("/ui/", ""),
      component: () => <p>{item.label} page</p>,
    }),
  );
  const router = createRouter({
    routeTree: rootRoute.addChildren([sectionRoute.addChildren(pages)]),
    history: createMemoryHistory({ initialEntries: [path] }),
  });

  return render(<RouterProvider router={router} />);
}

describe("SectionLayout", () => {
  it("lists every component in the section", async () => {
    renderAt("/ui/button");

    const nav = await screen.findByRole("navigation", { name: "UI components" });
    expect(nav.textContent).toContain("Button");
    expect(nav.textContent).toContain("Card");
  });

  it("marks the current component as the current page", async () => {
    renderAt("/ui/card");

    expect((await screen.findByRole("link", { name: "Card" })).getAttribute("aria-current")).toBe(
      "page",
    );
    expect(screen.getByRole("link", { name: "Button" }).getAttribute("aria-current")).toBeNull();
    expect(await screen.findByText("Card page")).toBeTruthy();
  });
});
