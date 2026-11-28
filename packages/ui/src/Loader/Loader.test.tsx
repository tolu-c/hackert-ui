// @vitest-environment jsdom

import { AppProvider } from "@hackert-ui/core";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vite-plus/test";

import { Loader } from "./Loader";

afterEach(cleanup);

function loader() {
  return screen.getByRole("status");
}

describe("Loader", () => {
  it("announces itself as a loading status", () => {
    render(<Loader />);

    expect(loader().getAttribute("aria-label")).toBe("Loading");
  });

  it("takes a custom accessible label", () => {
    render(<Loader aria-label="Saving" />);

    expect(loader().getAttribute("aria-label")).toBe("Saving");
  });

  it("is an oval by default", () => {
    render(<Loader />);

    expect(loader().dataset.type).toBe("oval");
  });

  it.each([
    ["bars", 3],
    ["dots", 3],
    ["oval", 0],
  ] as const)("renders the %s loader with %i parts", (type, parts) => {
    render(<Loader type={type} />);

    expect(loader().dataset.type).toBe(type);
    expect(loader().children).toHaveLength(parts);
  });

  it("maps a size key to a fixed pixel size", () => {
    render(<Loader size="xs" />);

    expect(loader().style.getPropertyValue("--hui-loader-size")).toBe("18px");
  });

  it("treats a numeric size as pixels", () => {
    render(<Loader size={24} />);

    expect(loader().style.getPropertyValue("--hui-loader-size")).toBe("24px");
  });

  it("inherits the text colour by default", () => {
    render(<Loader />);

    expect(loader().style.getPropertyValue("--hui-loader-color")).toBe("currentColor");
  });

  it("resolves a theme colour for both schemes", () => {
    render(
      <AppProvider
        theme={{ colors: { danger: "#111111" }, dark: { colors: { danger: "#eeeeee" } } }}
      >
        <Loader color="danger" />
      </AppProvider>,
    );

    expect(loader().style.getPropertyValue("--hui-loader-color")).toBe(
      "light-dark(#111111, #eeeeee)",
    );
  });

  it("passes a CSS colour through", () => {
    render(<Loader color="tomato" />);

    expect(loader().style.getPropertyValue("--hui-loader-color")).toBe("tomato");
  });

  it("adds one shared stylesheet however many loaders render", () => {
    render(
      <>
        <Loader />
        <Loader type="bars" />
      </>,
    );

    expect(document.head.querySelectorAll('style[data-href="hui-loader"]')).toHaveLength(1);
  });

  it("keeps the consumer's className", () => {
    render(<Loader className="mx-auto" />);

    expect(loader().className).toBe("hui-loader mx-auto");
  });
});
