---
"@hackert-ui/form": minor
---

Rebuilt on TanStack Form. New: `Form`, `FormField` (`.Label`, `.Description`, `.Error`), `TextInput`, `TextArea`, `NumberInput`, `SelectInput` (native, searchable or autocomplete), `SubmitButton`, `FormError`, plus `useAppForm`, `withForm` and the field and form contexts. `@tanstack/react-form` ^1.33.5 is now a peer dependency.

Breaking: `Input` is removed. Migrate to `form.AppField` with `field.TextInput` and a `FormField` for the label:

```tsx
<form.AppField name="email">
  {(field) => (
    <FormField>
      <FormField.Label>Email</FormField.Label>
      <field.TextInput type="email" />
    </FormField>
  )}
</form.AppField>
```
