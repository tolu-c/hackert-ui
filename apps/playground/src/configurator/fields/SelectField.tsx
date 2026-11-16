import { useId } from "react";
import type { SelectControl } from "../controls";
import { FieldLabel } from "./FieldLabel";
import type { FieldProps } from "./types";

export function SelectField({ control, value, onChange }: FieldProps<SelectControl>) {
  const id = useId();

  return (
    <div>
      <FieldLabel htmlFor={id}>{control.label}</FieldLabel>
      <select
        id={id}
        value={String(value)}
        onChange={(event) => onChange(event.currentTarget.value)}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
      >
        {control.options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
