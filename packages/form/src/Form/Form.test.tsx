// @vitest-environment jsdom

import type { PropsWithChildren } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { Form } from "./Form";

afterEach(cleanup);

function fakeForm() {
  return {
    AppForm: ({ children }: PropsWithChildren) => <>{children}</>,
    handleSubmit: vi.fn(),
  };
}

describe("Form", () => {
  it("prevents the native submit and calls handleSubmit", () => {
    const form = fakeForm();
    render(<Form form={form} aria-label="Sign in" />);

    const submitted = fireEvent.submit(screen.getByRole("form"));

    expect(submitted).toBe(false);
    expect(form.handleSubmit).toHaveBeenCalledTimes(1);
  });

  it("turns off native validation and passes form props through", () => {
    render(<Form form={fakeForm()} aria-label="Sign in" className="stack" />);

    const element = screen.getByRole("form") as HTMLFormElement;

    expect(element.noValidate).toBe(true);
    expect(element.className).toBe("stack");
  });

  it("renders its children inside the form's AppForm", () => {
    const form = fakeForm();
    form.AppForm = ({ children }) => <div data-testid="app-form">{children}</div>;
    render(
      <Form form={form}>
        <button type="submit">Go</button>
      </Form>,
    );

    expect(screen.getByTestId("app-form").contains(screen.getByRole("button"))).toBe(true);
  });
});
