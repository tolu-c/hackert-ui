import { Select } from "@hackert-ui/form";
import { useId } from "react";
import type { SelectControl } from "../controls";
import { FieldLabel } from "./FieldLabel";
import type { FieldProps } from "./types";

export function SelectField({ control, value, onChange }: FieldProps<SelectControl>) {
  const id = useId();

  return (
    <div>
      <FieldLabel htmlFor={id}>{control.label}</FieldLabel>
      <Select
        id={id}
        options={control.options}
        value={String(value)}
        onChange={(next) => onChange(next ?? control.defaultValue)}
      />
    </div>
  );
}
