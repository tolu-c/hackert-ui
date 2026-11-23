import { useId } from "react";

import { useFieldContext } from "../form-context";
import { useFieldValidity } from "./field-validity";
import { useFormFieldContext } from "./FormField";

// The accessibility wiring every input shares: id, aria-invalid, aria-describedby.
export function useFieldControl<TValue>() {
  const field = useFieldContext<TValue>();
  const fallbackId = useId();
  const formField = useFormFieldContext();
  const { invalid } = useFieldValidity();

  return {
    field,
    controlProps: {
      id: formField?.controlId ?? fallbackId,
      name: field.name,
      "aria-invalid": invalid || undefined,
      "aria-describedby": formField ? `${formField.descriptionId} ${formField.errorId}` : undefined,
      onBlur: field.handleBlur,
    },
  };
}
