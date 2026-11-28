// @vitest-environment jsdom

import { DEFAULT_THEME } from "@hackert-ui/core";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vite-plus/test";

import { Skeleton } from "./Skeleton";

afterEach(cleanup);

function skeleton() {
  const element = document.querySelector<HTMLElement>(".hui-skeleton");
  if (!element) throw new Error("no skeleton rendered");
  return element;
}

describe("Skeleton", () => {
  it("sizes itself, treating numbers as pixels", () => {
    render(<Skeleton height={8} width="70%" />);

    expect(skeleton().style.height).toBe("8px");
    expect(skeleton().style.width).toBe("70%");
  });

  it("rounds from the radius scale, defaulting to sm", () => {
    render(<Skeleton height={8} />);

    expect(skeleton().style.borderRadius).toBe(DEFAULT_THEME.radius.sm);
  });

  it("accepts a CSS radius", () => {
    render(<Skeleton height={8} radius="999px" />);

    expect(skeleton().style.borderRadius).toBe("999px");
  });

  it("makes a circle from its height", () => {
    render(<Skeleton height={40} width={200} circle />);

    expect(skeleton().style.width).toBe("40px");
    expect(skeleton().style.height).toBe("40px");
    expect(skeleton().style.borderRadius).toBe("40px");
  });

  it("animates unless told not to", () => {
    const { rerender } = render(<Skeleton height={8} />);
    expect(skeleton().hasAttribute("data-animate")).toBe(true);

    rerender(<Skeleton height={8} animate={false} />);
    expect(skeleton().hasAttribute("data-animate")).toBe(false);
  });

  it("covers its children while visible and keeps them out of reach", () => {
    render(
      <Skeleton>
        <button type="button">Hidden action</button>
      </Skeleton>,
    );

    expect(skeleton().hasAttribute("data-visible")).toBe(true);
    expect(skeleton().hasAttribute("inert")).toBe(true);
    expect(skeleton().getAttribute("aria-busy")).toBe("true");
  });

  it("shows its children once loading ends without remounting them", () => {
    function Counter() {
      const [count, setCount] = useState(0);
      return (
        <button type="button" onClick={() => setCount((value) => value + 1)}>
          {count}
        </button>
      );
    }
    const { rerender } = render(
      <Skeleton visible={false}>
        <Counter />
      </Skeleton>,
    );
    fireEvent.click(screen.getByRole("button"));

    rerender(
      <Skeleton visible>
        <Counter />
      </Skeleton>,
    );
    rerender(
      <Skeleton visible={false}>
        <Counter />
      </Skeleton>,
    );

    expect(skeleton().hasAttribute("data-visible")).toBe(false);
    expect(skeleton().hasAttribute("inert")).toBe(false);
    expect(screen.getByRole("button").textContent).toBe("1");
  });

  it("adds one shared stylesheet however many skeletons render", () => {
    render(
      <>
        <Skeleton height={8} />
        <Skeleton height={8} />
      </>,
    );

    expect(document.head.querySelectorAll('style[data-href="hui-skeleton"]')).toHaveLength(1);
  });
});
