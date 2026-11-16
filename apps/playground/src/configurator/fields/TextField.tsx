import { useId } from "react";
import type { TextControl } from "../controls";
import { FieldLabel } from "./FieldLabel";
import type { FieldProps } from "./types";

export function TextField({ control, value, onChange }: FieldProps<TextControl>) {
  const id = useId();

  return (
    <div>
      <FieldLabel htmlFor={id}>{control.label}</FieldLabel>
      <input
        id={id}
        type="text"
        value={String(value)}
        onChange={(event) => onChange(event.currentTarget.value)}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
      />
    </div>
  );
}
