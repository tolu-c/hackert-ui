import type { Control, ControlValue } from "../controls";

export interface FieldProps<C extends Control> {
  readonly control: C;
  readonly value: ControlValue;
  readonly onChange: (value: ControlValue) => void;
}
