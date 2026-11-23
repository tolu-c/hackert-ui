import type { FocusEvent } from "react";
import { useSelector } from "@tanstack/react-form";

import { useFieldControl } from "../FormField/field-control";
import type { SelectPrimitive } from "./options";
import { Select, type SelectProps } from "./Select";

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

export type SelectInputProps<TValue extends SelectPrimitive = string> = DistributiveOmit<
  SelectProps<TValue>,
  "value" | "onChange" | "id" | "name"
>;

// Select bound to the surrounding TanStack field.
export function SelectInput<TValue extends SelectPrimitive = string>(
  props: SelectInputProps<TValue>,
) {
  const { field, controlProps } = useFieldControl<TValue | string | null>();
  const value = useSelector(field.store, (state) => state.value) ?? null;
  const selectProps = {
    ...props,
    ...controlProps,
    value: props.mode === "autocomplete" ? (value ?? "") : value,
    onChange: field.handleChange,
    onBlur: (event: FocusEvent<HTMLInputElement>) => {
      controlProps.onBlur();
      props.onBlur?.(event);
    },
  } as SelectProps<TValue>;

  return <Select<TValue> {...selectProps} />;
}
