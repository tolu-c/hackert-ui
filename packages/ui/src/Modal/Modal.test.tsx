// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vite-plus/test";

import { Modal } from "./Modal";

afterEach(cleanup);

describe("Modal", () => {
  it("renders its children", () => {
    render(<Modal>Hello</Modal>);

    expect(screen.getByText("Hello")).toBeTruthy();
  });
});
