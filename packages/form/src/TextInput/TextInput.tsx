import type { ComponentPropsWithoutRef } from "react";
import { useSelector } from "@tanstack/react-form";

import { useFieldControl } from "../FormField/field-control";

export interface TextInputProps extends Omit<
  ComponentPropsWithoutRef<"input">,
  "type" | "value" | "defaultValue" | "id" | "name" | "onChange"
> {
  readonly type?: "text" | "email" | "password" | "tel" | "url" | "search";
}

export function TextInput({ type = "text", ...inputProps }: TextInputProps) {
  const { field, controlProps } = useFieldControl<string>();
  const value = useSelector(field.store, (state) => state.value);

  return (
    <input
      {...inputProps}
      {...controlProps}
      type={type}
      value={value ?? ""}
      onChange={(event) => field.handleChange(event.target.value)}
      onBlur={(event) => {
        controlProps.onBlur();
        inputProps.onBlur?.(event);
      }}
    />
  );
}
