# @hackert-ui/core

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
