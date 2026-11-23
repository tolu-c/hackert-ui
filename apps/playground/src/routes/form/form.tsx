import { Form, FormField, useAppForm } from "@hackert-ui/form";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { pageHead } from "@/catalog";
import { Demo } from "@/components/Demo";
import { PageHeader } from "@/components/PageHeader";
import { UsageHeading } from "@/components/UsageHeading";

const IMPORT = 'import { Form, FormField, useAppForm } from "@hackert-ui/form";';

const SOURCE = `${IMPORT}

function SignIn() {
  const form = useAppForm({
    defaultValues: { email: "", password: "" },
    validators: {
      onChange: ({ value }) => ({
        fields: {
          email: value.email.includes("@") ? undefined : "Enter a valid email",
          password: value.password.length >= 8 ? undefined : "At least 8 characters",
        },
      }),
      onSubmitAsync: async ({ value }) => {
        try {
          await signIn(value);
          return undefined;
        } catch (error) {
          // { form?: string, fields?: Record<string, string> }
          return toServerFormErrors(error);
        }
      },
    },
    onSubmit: ({ value }) => console.log(value),
  });

  return (
    <Form form={form} className="flex flex-col gap-4">
      <form.FormError />
      <form.AppField name="email">
        {(field) => (
          <FormField>
            <FormField.Label>Email</FormField.Label>
            <field.TextInput type="email" autoComplete="email" />
            <FormField.Description>We never share it.</FormField.Description>
            <FormField.Error />
          </FormField>
        )}
      </form.AppField>
      <form.AppField name="password">
        {(field) => (
          <FormField>
            <FormField.Label>Password</FormField.Label>
            <field.TextInput type="password" autoComplete="current-password" />
            <FormField.Error />
          </FormField>
        )}
      </form.AppField>
      <form.SubmitButton>Sign in</form.SubmitButton>
    </Form>
  );
}`;

export const Route = createFileRoute("/form/form")({
  head: () => pageHead("/form/form"),
  component: FormPage,
});

function FormPage() {
  return (
    <div>
      <PageHeader to="/form/form" importLine={IMPORT} />

      <UsageHeading />
      <Demo
        title="Sign in"
        description='Errors appear after a field is blurred or the form is submitted. Try "taken@example.com" for a server error on the field, and "down@example.com" for a form-level error.'
        source={SOURCE}
      >
        <SignInDemo />
      </Demo>
    </div>
  );
}

interface ServerErrors {
  readonly form?: string;
  readonly fields?: Readonly<Record<string, string>>;
}

function fakeSignIn(email: string): Promise<ServerErrors | undefined> {
  return new Promise((resolve) =>
    setTimeout(() => {
      if (email === "taken@example.com") resolve({ fields: { email: "That email is taken" } });
      else if (email === "down@example.com") resolve({ form: "Something went wrong. Try again." });
      else resolve(undefined);
    }, 800),
  );
}

function SignInDemo() {
  const [signedInAs, setSignedInAs] = useState<string | null>(null);
  const form = useAppForm({
    defaultValues: { email: "", password: "" },
    validators: {
      onChange: ({ value }) => ({
        fields: {
          email: value.email.includes("@") ? undefined : "Enter a valid email",
          password: value.password.length >= 8 ? undefined : "At least 8 characters",
        },
      }),
      onSubmitAsync: ({ value }) => fakeSignIn(value.email),
    },
    onSubmit: ({ value }) => setSignedInAs(value.email),
  });

  return (
    <div className="w-full max-w-sm">
      <Form form={form} className="flex flex-col gap-4">
        <form.FormError className="text-sm text-red-600" />
        <form.AppField name="email">
          {(field) => (
            <FormField className="flex flex-col gap-1">
              <FormField.Label className="text-sm font-medium">Email</FormField.Label>
              <field.TextInput
                type="email"
                autoComplete="email"
                className="rounded-md border border-line px-3 py-2 text-sm aria-invalid:border-red-500"
              />
              <FormField.Description className="text-xs text-fg-muted">
                We never share it.
              </FormField.Description>
              <FormField.Error className="text-xs text-red-600" />
            </FormField>
          )}
        </form.AppField>
        <form.AppField name="password">
          {(field) => (
            <FormField className="flex flex-col gap-1">
              <FormField.Label className="text-sm font-medium">Password</FormField.Label>
              <field.TextInput
                type="password"
                autoComplete="current-password"
                className="rounded-md border border-line px-3 py-2 text-sm aria-invalid:border-red-500"
              />
              <FormField.Error className="text-xs text-red-600" />
            </FormField>
          )}
        </form.AppField>
        <form.SubmitButton className="rounded-md border border-line px-3 py-2 text-sm disabled:opacity-60">
          Sign in
        </form.SubmitButton>
        {signedInAs ? <p className="text-sm text-fg-soft">Signed in as {signedInAs}</p> : null}
      </Form>
    </div>
  );
}
