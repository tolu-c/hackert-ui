import { useSelector } from "@tanstack/react-form";

import { toErrorMessages } from "../errors";
import { useFieldContext } from "../form-context";

// A field's errors are only shown once it was blurred or the form was submitted.
export function useFieldValidity() {
  const field = useFieldContext();
  const errors = useSelector(field.store, (state) => state.meta.errors);
  const blurred = useSelector(field.store, (state) => state.meta.isBlurred);
  const attempts = useSelector(field.form.store, (state) => state.submissionAttempts);
  const messages = blurred || attempts > 0 ? toErrorMessages(errors) : [];

  return { messages, invalid: messages.length > 0 };
}
