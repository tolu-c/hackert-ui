// @vitest-environment jsdom

import { cleanup, render } from "@testing-library/react";
import { memo } from "react";
import { afterEach, describe, expect, it } from "vite-plus/test";

import { AppProvider, DEFAULT_THEME, useAppTheme } from "../index";
import type { AppTheme } from "../theme/types";

afterEach(cleanup);

describe("AppProvider", () => {
  it("provides the immutable default theme", () => {
    let observedTheme: Readonly<AppTheme> | undefined;

    function Probe() {
      observedTheme = useAppTheme();
      return null;
    }

    render(
      <AppProvider>
        <Probe />
      </AppProvider>,
    );

    expect(observedTheme).toBe(DEFAULT_THEME);
    expect(Object.isFrozen(DEFAULT_THEME)).toBe(true);
    expect(Object.isFrozen(DEFAULT_THEME.colors)).toBe(true);
    expect(Object.isFrozen(DEFAULT_THEME.radius)).toBe(true);
    expect(Object.isFrozen(DEFAULT_THEME.spacing)).toBe(true);
  });

  it("merges a one-leaf override without changing siblings or defaults", () => {
    let observedTheme: Readonly<AppTheme> | undefined;
    const colors = Object.freeze({ primary: "#000000" });
    const override = Object.freeze({ colors });

    function Probe() {
      observedTheme = useAppTheme();
      return null;
    }

    render(
      <AppProvider theme={override}>
        <Probe />
      </AppProvider>,
    );

    expect(observedTheme?.colors.primary).toBe("#000000");
    expect(observedTheme?.colors.secondary).toBe(DEFAULT_THEME.colors.secondary);
    expect(observedTheme?.radius).toEqual(DEFAULT_THEME.radius);
    expect(observedTheme?.spacing).toEqual(DEFAULT_THEME.spacing);
    expect(observedTheme?.fontFamily).toBe(DEFAULT_THEME.fontFamily);
    expect(DEFAULT_THEME.colors.primary).toBe("#2563eb");
    expect(override).toEqual({ colors: { primary: "#000000" } });
  });

  it("inherits the nearest resolved parent theme", () => {
    let observedTheme: Readonly<AppTheme> | undefined;

    function Probe() {
      observedTheme = useAppTheme();
      return null;
    }

    render(
      <AppProvider
        theme={{
          colors: { primary: "parent-primary" },
          spacing: { lg: "30px" },
        }}
      >
        <AppProvider theme={{ colors: { secondary: "child-secondary" } }}>
          <Probe />
        </AppProvider>
      </AppProvider>,
    );

    expect(observedTheme?.colors.primary).toBe("parent-primary");
    expect(observedTheme?.colors.secondary).toBe("child-secondary");
    expect(observedTheme?.spacing.lg).toBe("30px");
    expect(observedTheme?.colors.success).toBe(DEFAULT_THEME.colors.success);
  });

  it("throws when useAppTheme is called outside AppProvider", () => {
    function Probe() {
      useAppTheme();
      return null;
    }

    expect(() => render(<Probe />)).toThrow("useAppTheme must be used within AppProvider");
  });

  it("keeps the context value stable when its inputs are unchanged", () => {
    const override = { radius: { md: "10px" } } as const;
    const observedThemes: Readonly<AppTheme>[] = [];

    const Probe = memo(function Probe() {
      observedThemes.push(useAppTheme());
      return null;
    });

    const view = render(
      <AppProvider theme={override}>
        <Probe />
      </AppProvider>,
    );

    view.rerender(
      <AppProvider theme={override}>
        <Probe />
      </AppProvider>,
    );

    expect(observedThemes).toHaveLength(1);
  });
});
