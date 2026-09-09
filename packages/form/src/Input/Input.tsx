import type { ComponentPropsWithoutRef } from "react";
import { useId } from "react";

export interface InputProps
  extends Omit<ComponentPropsWithoutRef<"input">, "id"> {
  readonly label?: string | undefined;
}

export function Input({ label, ...inputProps }: InputProps) {
  const id = useId();

  return (
    <div>
      {label ? <label htmlFor={id}>{label}</label> : null}
      <input id={id} {...inputProps} />
    </div>
  );
}
