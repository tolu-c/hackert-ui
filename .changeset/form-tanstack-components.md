---
"@hackert-ui/form": minor
---

Rebuilt on TanStack Form. New: `Form`, `FormField` (`.Label`, `.Description`, `.Error`), `TextInput` (with a password visibility toggle), `TextArea`, `NumberInput` (currency symbol inside the input), `SelectInput` and the standalone `Select` (a styled dropdown in select, searchable or autocomplete mode, with check icons, groups, `nothingFoundMessage`, and string, number, boolean, object or grouped options), `SubmitButton` (built on `Button` from `@hackert-ui/ui`), `FormError`, plus `useAppForm`, `withForm` and the field and form contexts.

The components are themed from `@hackert-ui/core` (primary and danger colours, radius, font, dark mode) through a stylesheet in `@layer components`, so your `className` still wins.

New peer dependencies: `@tanstack/react-form` ^1.33.5, `@hackert-ui/core`, `@hackert-ui/ui` and `react-dom`. New dependencies: `@floating-ui/react-dom` and hugeicons (`@hugeicons/react`, `@hugeicons/core-free-icons`).

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
