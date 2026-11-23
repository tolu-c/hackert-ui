import type { ComponentPropsWithoutRef } from "react";
import { useSelector } from "@tanstack/react-form";

import { useFormContext } from "../form-context";

export type SubmitButtonProps = Omit<ComponentPropsWithoutRef<"button">, "type">;

export function SubmitButton({ disabled, ...buttonProps }: SubmitButtonProps) {
  const form = useFormContext();
  const isSubmitting = useSelector(form.store, (state) => state.isSubmitting);
  const canSubmit = useSelector(form.store, (state) => state.canSubmit);

  return (
    <button
      {...buttonProps}
      type="submit"
      disabled={disabled || isSubmitting}
      aria-busy={isSubmitting || undefined}
      data-submitting={isSubmitting ? "" : undefined}
      data-invalid={canSubmit ? undefined : ""}
    />
  );
}
