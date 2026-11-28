# @hackert-ui/form

## 0.2.0

### Minor Changes

- ca4dab4: **Breaking:** Button's theme colour moves from `variant` to `color`, and `variant` now picks the style.

  Migrate by renaming the prop: `<Button variant="danger">` becomes `<Button color="danger">`. `SubmitButton` takes the same props.

  - `color` takes a theme key (default `primary`) or any CSS colour: a name such as `tomato`, hex, `rgb()` or `oklch()`.
  - `variant` is `filled` (default), `light`, `outline`, `subtle`, `transparent` or `default`. `default` is a neutral bordered button that ignores `color`.
  - New props: `leftSection` and `rightSection`, `justify` (`center` or `space-between`), and `fullWidth`.
  - While `loading`, the label is covered by a `Loader` spinner instead of the button greying out. The button keeps its width and colours, and it stays disabled with `aria-busy`. Pass `loaderProps` to choose the spinner.
  - Button text is now medium weight. Every variant draws a 1px border (transparent when unused), so mixed variants line up.
  - `@hackert-ui/core`: `useVariantColors(color)` and `deriveVariantColors` take a theme key or any CSS colour, and they parse CSS colour names. The result adds `text` (the colour adjusted to be readable on the page) plus `lightBackground` and `lightHoverBackground` (translucent tints). Error messages now name the colour rather than a "variant".

- ead570e: `PhoneInput`, and danger-coloured labels on invalid fields.

  - `field.PhoneInput` is a phone number field with a searchable country picker (flag, name and dialling code; search by name or code). It formats the number as you type, and its field value is E.164 (`"+2348031234567"`), or `""` when empty. Props: `defaultCountry` (default `"US"`), `countries` to limit the list, `locale` for country names, plus `searchPlaceholder`, `searchLabel`, `nothingFoundMessage` and `countryLabel` for translation. A stored number opens in its own country's national format, and a number typed with `+` switches to its country. Backspace over a formatting character deletes the digit before it. It depends on `libphonenumber-js`.
  - While a `FormField` shows an error, its `FormField.Label` and `FormField.Description` now turn the theme's `danger` colour, alongside the red border and message.

## 0.1.0

### Minor Changes

- 05cbf90: Rebuilt on TanStack Form. New: `Form`, `FormField` (`.Label`, `.Description`, `.Error`), `TextInput` (with a password visibility toggle), `TextArea`, `NumberInput` (currency symbol inside the input), `SelectInput` and the standalone `Select` (a styled dropdown in select, searchable or autocomplete mode, with check icons, groups, `nothingFoundMessage`, and string, number, boolean, object or grouped options), `SubmitButton` (built on `Button` from `@hackert-ui/ui`), `FormError`, plus `useAppForm`, `withForm` and the field and form contexts.

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

## 0.0.1

### Patch Changes

- 2c78f85: First release on the 0.0.x line, with everything from 0.2.0. 0.2.0 was
  published by mistake and is deprecated; install 0.0.1 or later.

## 0.2.0

Deprecated: published by mistake. Use 0.0.1 or later.

### Minor Changes

- 58f1356: First publishable release.

  - All packages are now publishable with curated public exports, React peer
    ranges, and repository metadata.
  - `useDisclosure` now runs `onOpen`/`onClose` alongside the state update
    instead of replacing it, and only fires on an actual transition.
  - `Button` and `Card` accept their native element props; `Card` children
    widened from `string` to `ReactNode`.
  - `Button` no longer uses Tailwind utility classes. It accepts `variant`, `size` and
    `radius` props, styles itself through a hoisted stylesheet with hover,
    press, focus and disabled states, and exposes the theme as `--hui-*`
    custom properties. Consumer `className` and `style` override it.
    Requires Tailwind v4: the stylesheet declares Tailwind v4's layer order
    (`theme, base, components, utilities`) for the page, so apps using other
    cascade layer names or Tailwind v3 are not supported.
  - `@hackert-ui/core` exports `useSafeAppTheme`, which falls back to
    `DEFAULT_THEME` outside `AppProvider` instead of throwing, and
    `useVariantColors`, which derives readable text, hover and active colours
    from a theme colour (hex, `rgb()` or `oklch()`).
  - Every copy of `@hackert-ui/core` shares one theme context, so a duplicated
    install can no longer make components ignore `AppProvider`.
  - Packages version in lockstep.
  - `@hackert-ui/hooks` adds `useDebouncedValue`.
  - `@hackert-ui/utils` adds `cn`, a `clsx` + `tailwind-merge` class helper.
  - `@hackert-ui/dates` is scaffolded with a placeholder `DateInput`.
  - `Input` associates its label with the input via `useId`.
  - Optional public props are declared `| undefined` so consumers using
    `exactOptionalPropertyTypes` can forward optional values.
