import type { ComponentPropsWithoutRef } from "react";
import { useSelector } from "@tanstack/react-form";

import { useFieldControl } from "../FormField/field-control";

export interface TextAreaProps extends Omit<
  ComponentPropsWithoutRef<"textarea">,
  "value" | "defaultValue" | "id" | "name" | "onChange"
> {}

export function TextArea(textAreaProps: TextAreaProps) {
  const { field, controlProps } = useFieldControl<string>();
  const value = useSelector(field.store, (state) => state.value);

  return (
    <textarea
      {...textAreaProps}
      {...controlProps}
      value={value ?? ""}
      onChange={(event) => field.handleChange(event.target.value)}
      onBlur={(event) => {
        controlProps.onBlur();
        textAreaProps.onBlur?.(event);
      }}
    />
  );
}
