import { Button, type ButtonProps } from "@hackert-ui/ui";
import { useSelector } from "@tanstack/react-form";

import { useFormContext } from "../form-context";

export type SubmitButtonProps = Omit<ButtonProps, "type" | "loading">;

// Button from @hackert-ui/ui, in its loading state while the form submits.
export function SubmitButton(buttonProps: SubmitButtonProps) {
  const form = useFormContext();
  const isSubmitting = useSelector(form.store, (state) => state.isSubmitting);
  const canSubmit = useSelector(form.store, (state) => state.canSubmit);

  return (
    <Button
      {...buttonProps}
      type="submit"
      loading={isSubmitting}
      data-submitting={isSubmitting ? "" : undefined}
      data-invalid={canSubmit ? undefined : ""}
    />
  );
}
