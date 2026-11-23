import type { ComponentPropsWithoutRef } from "react";
import { ViewIcon, ViewOffSlashIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useSelector } from "@tanstack/react-form";
import { useState } from "react";

import { useFieldControl } from "../FormField/field-control";
import { InputBase } from "../styles/InputBase";
import { cx } from "../styles/theme-vars";

export interface VisibilityToggleLabels {
  readonly show: string;
  readonly hide: string;
}

export interface TextInputProps extends Omit<
  ComponentPropsWithoutRef<"input">,
  "type" | "value" | "defaultValue" | "id" | "name" | "onChange"
> {
  readonly type?: "text" | "email" | "password" | "tel" | "url" | "search";
  // Only used with type="password": a button that reveals the password.
  readonly visibilityToggle?: boolean | undefined;
  readonly visibilityToggleLabels?: VisibilityToggleLabels | undefined;
}

const DEFAULT_LABELS: VisibilityToggleLabels = { show: "Show password", hide: "Hide password" };

export function TextInput({
  type = "text",
  visibilityToggle = true,
  visibilityToggleLabels = DEFAULT_LABELS,
  className,
  ...inputProps
}: TextInputProps) {
  const { field, controlProps } = useFieldControl<string>();
  const value = useSelector(field.store, (state) => state.value);
  const [revealed, setRevealed] = useState(false);
  const toggleable = type === "password" && visibilityToggle;

  const toggle = toggleable ? (
    <button
      type="button"
      className="hui-section-button"
      aria-label={revealed ? visibilityToggleLabels.hide : visibilityToggleLabels.show}
      aria-pressed={revealed}
      aria-controls={controlProps.id}
      disabled={inputProps.disabled}
      // Keep focus and the caret in the input.
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => setRevealed((current) => !current)}
    >
      <HugeiconsIcon
        icon={ViewIcon}
        altIcon={ViewOffSlashIcon}
        showAlt={revealed}
        size={16}
        aria-hidden="true"
      />
    </button>
  ) : undefined;

  return (
    <InputBase rightSection={toggle}>
      <input
        {...inputProps}
        {...controlProps}
        type={toggleable && revealed ? "text" : type}
        className={cx("hui-input", className)}
        value={value ?? ""}
        onChange={(event) => field.handleChange(event.target.value)}
        onBlur={(event) => {
          controlProps.onBlur();
          inputProps.onBlur?.(event);
        }}
      />
    </InputBase>
  );
}
