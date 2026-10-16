---
"@hackert-ui/core": minor
"@hackert-ui/dates": minor
"@hackert-ui/form": minor
"@hackert-ui/hooks": minor
"@hackert-ui/ui": minor
"@hackert-ui/utils": minor
---

First publishable release.

- All packages are now publishable with curated public exports, React peer
  ranges, and repository metadata.
- `useDisclosure` now runs `onOpen`/`onClose` alongside the state update
  instead of replacing it, and only fires on an actual transition.
- `Button` and `Card` accept their native element props; `Card` children
  widened from `string` to `ReactNode`.
- `Button` no longer hardcodes Tailwind utility classes, which rendered as
  nothing for consumers who do not use Tailwind. It now reads the resolved
  theme through `useSafeAppTheme` and accepts `variant`, `size` and `radius`
  props; consumer `className` and `style` win over the defaults.
- `@hackert-ui/core` exports `useSafeAppTheme`, which falls back to
  `DEFAULT_THEME` outside `AppProvider` instead of throwing.
- `@hackert-ui/hooks` adds `useDebouncedValue`.
- `@hackert-ui/utils` adds `cn`, a `clsx` + `tailwind-merge` class helper.
- `@hackert-ui/dates` is scaffolded with a placeholder `DateInput`.
- `Input` associates its label with the input via `useId`.
- Optional public props are declared `| undefined` so consumers using
  `exactOptionalPropertyTypes` can forward optional values.
