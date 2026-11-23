# @hackert-ui/form

Form components built on [TanStack Form](https://tanstack.com/form): `Form`,
`FormField` (`.Label`, `.Description`, `.Error`), `TextInput`, `TextArea`,
`NumberInput`, `SelectInput` (and the standalone `Select`), `SubmitButton` and
`FormError`. They are themed from `@hackert-ui/core`, follow dark mode through
`light-dark()`, and keep their styles in `@layer components`, so a `className`
always wins. State is exposed as `data-*` attributes.

```sh
pnpm add @hackert-ui/form @hackert-ui/core @hackert-ui/ui @hackert-ui/utils @tanstack/react-form
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

`TextInput` with `type="password"` shows a reveal button; turn it off with
`visibilityToggle={false}` or translate it with `visibilityToggleLabels`.

`NumberInput` takes `currency`, `locale`, `decimals`, `thousandSeparator` and
`allowNegative`; its value is `number | null`. The currency symbol sits inside the
input, on the side the locale writes it. It is decorative, so name the currency in
the label.

`SelectInput` (bound to a field) and `Select` (controlled with `value` and
`onChange`) take `options` and `mode`: `"select"` (a styled dropdown),
`"searchable"` (filter by typing; the value must be an option) or
`"autocomplete"` (free text, options as suggestions; the picked label becomes the
value). `options` accepts strings, numbers or booleans, `{ value, label?, disabled? }`
objects, and `{ group, items }` groups of either, mixed freely; the value keeps its
type (`Select<number>` hands back numbers). Also `nothingFoundMessage`,
`withCheckIcon`, `checkIconPosition` and `withAlignedLabels`. The dropdown flips
above the input when there is no room below.

`SubmitButton` is `Button` from `@hackert-ui/ui`, disabled and `aria-busy` while
the form submits; it takes `Button`'s `variant`, `size` and `radius`.

To add your own components, call `createFormHook` with the exported `fieldContext`
and `formContext`.

Part of [hackert-ui](https://github.com/tolu-c/hackert-ui). Requires React 19.
All `@hackert-ui/*` packages share one version; install
matching versions.

## License

MIT
