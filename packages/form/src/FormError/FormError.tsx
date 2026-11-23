import type { ComponentPropsWithoutRef } from "react";
import { useSelector } from "@tanstack/react-form";

import { toErrorMessages } from "../errors";
import { useFormContext } from "../form-context";

export type FormErrorProps = Omit<ComponentPropsWithoutRef<"div">, "children" | "role">;

export function FormError(divProps: FormErrorProps) {
  const form = useFormContext();
  const errors = useSelector(form.store, (state) => state.errors);
  const messages = toErrorMessages(errors);

  if (messages.length === 0) return null;

  return (
    <div {...divProps} role="alert">
      {messages.map((message) => (
        <p key={message}>{message}</p>
      ))}
    </div>
  );
}
