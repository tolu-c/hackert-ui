import type { ComponentPropsWithoutRef } from "react";
import { createContext, useContext, useId, useMemo } from "react";

import { useFieldValidity } from "./field-validity";

interface FormFieldContextValue {
  readonly controlId: string;
  readonly descriptionId: string;
  readonly errorId: string;
}

const FormFieldContext = createContext<FormFieldContextValue | null>(null);

export function useFormFieldContext() {
  return useContext(FormFieldContext);
}

export interface FormFieldProps extends ComponentPropsWithoutRef<"div"> {}

function FormFieldRoot({ children, ...divProps }: FormFieldProps) {
  const id = useId();
  const value = useMemo(
    () => ({
      controlId: `${id}-control`,
      descriptionId: `${id}-description`,
      errorId: `${id}-error`,
    }),
    [id],
  );
  const { invalid } = useFieldValidity();

  return (
    <FormFieldContext value={value}>
      <div {...divProps} data-invalid={invalid ? "" : undefined}>
        {children}
      </div>
    </FormFieldContext>
  );
}

function useRequiredFormField(part: string) {
  const context = useFormFieldContext();
  if (!context) throw new Error(`FormField.${part} must be rendered inside <FormField>`);
  return context;
}

export type FormFieldLabelProps = Omit<ComponentPropsWithoutRef<"label">, "htmlFor">;

function Label(props: FormFieldLabelProps) {
  const { controlId } = useRequiredFormField("Label");
  return <label {...props} htmlFor={controlId} />;
}

export type FormFieldDescriptionProps = Omit<ComponentPropsWithoutRef<"p">, "id">;

function Description(props: FormFieldDescriptionProps) {
  const { descriptionId } = useRequiredFormField("Description");

  return <p {...props} id={descriptionId} />;
}

export type FormFieldErrorProps = Omit<ComponentPropsWithoutRef<"p">, "id" | "children">;

function FieldError(props: FormFieldErrorProps) {
  const { errorId } = useRequiredFormField("Error");
  const { messages } = useFieldValidity();

  return (
    <p {...props} id={errorId} aria-live="polite">
      {messages.join(" ")}
    </p>
  );
}

export const FormField = Object.assign(FormFieldRoot, {
  Label,
  Description,
  Error: FieldError,
});
