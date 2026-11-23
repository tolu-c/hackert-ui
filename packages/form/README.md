# @hackert-ui/form

Form components built on [TanStack Form](https://tanstack.com/form): `Form`,
`FormField` (`.Label`, `.Description`, `.Error`), `TextInput`, `TextArea`,
`NumberInput`, `SelectInput`, `SubmitButton` and `FormError`. They ship unstyled
and take a `className`; state is exposed as `data-*` attributes.

```sh
pnpm add @hackert-ui/form @tanstack/react-form
```

```tsx
import { Form, FormField, useAppForm } from "@hackert-ui/form";

function SignIn() {
  const form = useAppForm({
    defaultValues: { email: "" },
    validators: {
      onSubmitAsync: async ({ value }) => {
        try {
          await signIn(value);
        } catch (error) {
          return { form: "Sign-in failed", fields: { email: "Unknown email" } };
        }
      },
    },
    onSubmit: ({ value }) => console.log(value),
  });

  return (
    <Form form={form}>
      <form.FormError />
      <form.AppField name="email">
        {(field) => (
          <FormField>
            <FormField.Label>Email</FormField.Label>
            <field.TextInput type="email" />
            <FormField.Error />
          </FormField>
        )}
      </form.AppField>
      <form.SubmitButton>Sign in</form.SubmitButton>
    </Form>
  );
}
```

Field errors show once a field is blurred or the form was submitted. Server errors
returned from `onSubmitAsync` as `{ form?, fields? }` appear in `FormError` and the
matching `FormField.Error`.

`NumberInput` takes `currency`, `locale`, `decimals`, `thousandSeparator` and
`allowNegative`; its value is `number | null`. `SelectInput` takes `options` and
`mode`: `"select"` (native), `"searchable"` (value must be an option) or
`"autocomplete"` (free text, options as suggestions; the picked label becomes the value).

To add your own components, call `createFormHook` with the exported `fieldContext`
and `formContext`.

Part of [hackert-ui](https://github.com/tolu-c/hackert-ui). Requires React 19.
All `@hackert-ui/*` packages share one version; install
matching versions.

## License

MIT
