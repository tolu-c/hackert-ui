import type { ComponentPropsWithoutRef } from "react";
import { useSelector } from "@tanstack/react-form";

import { useFieldControl } from "../FormField/field-control";
import { InputBase } from "../styles/InputBase";
import { cx } from "../styles/theme-vars";

export interface TextAreaProps extends Omit<
  ComponentPropsWithoutRef<"textarea">,
  "value" | "defaultValue" | "id" | "name" | "onChange"
> {}

export function TextArea({ className, ...textAreaProps }: TextAreaProps) {
  const { field, controlProps } = useFieldControl<string>();
  const value = useSelector(field.store, (state) => state.value);

  return (
    <InputBase>
      <textarea
        {...textAreaProps}
        {...controlProps}
        className={cx("hui-input", className)}
        value={value ?? ""}
        onChange={(event) => field.handleChange(event.target.value)}
        onBlur={(event) => {
          controlProps.onBlur();
          textAreaProps.onBlur?.(event);
        }}
      />
    </InputBase>
  );
}
