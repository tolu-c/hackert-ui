# @hackert-ui/ui

## 0.1.0

### Patch Changes

- 87449ec: Button text now scales with `size`, from 12px at `xs` to 24px at `2xl` (16px at the default `md`). Override it per button with a utility class such as `text-sm`, or with the `--hui-font-size` variable.
- f0caab3: Button takes a `loading` prop. While loading it is disabled and sets `aria-busy` and `data-loading`, so you can style the busy state.
- d7ee53d: Export placeholder `CloseButton`, `CopyButton`, `EmptyState`, `Loader`, `Modal`, `Notification`, `Skeleton` and `Tabs`. They are not implemented yet: each renders a stand-in element, and their props will change before they are ready, so don't build on them yet.

## 0.0.1

### Patch Changes

- 3fa2e23: Dark mode.

  - `@hackert-ui/core`: the theme gains a `dark.colors` palette, overridable via
    `theme.dark.colors`. A light colour override without a dark one applies in
    both schemes. `useVariantColors(variant, scheme?)` takes `"light"` (default)
    or `"dark"`; in dark mode hover and press lighten instead of darken. Exports
    the `ColorScheme` type.
  - `@hackert-ui/ui`: `Button` carries both palettes as CSS `light-dark()` values,
    so it follows the page's `color-scheme` with no React state and no flash on
    first paint. Set `color-scheme: light dark` on `:root` to follow the OS, or
    `.dark { color-scheme: dark }` for a class toggle.
    `Button` needs `light-dark()` support (Chrome 123, Safari 17.5, Firefox 120);
    on older browsers its colours do not apply, even without dark mode.

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
