import type { ComponentPropsWithoutRef, ComponentType, PropsWithChildren } from "react";

interface FormApi {
  readonly AppForm: ComponentType<PropsWithChildren>;
  readonly handleSubmit: () => void | Promise<void>;
}

export interface FormProps extends Omit<
  ComponentPropsWithoutRef<"form">,
  "onSubmit" | "noValidate"
> {
  readonly form: FormApi;
}

export function Form({ form, children, ...formProps }: FormProps) {
  return (
    <form.AppForm>
      <form
        {...formProps}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        {children}
      </form>
    </form.AppForm>
  );
}
