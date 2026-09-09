---
"@hackert-ui/core": minor
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
- `Input` associates its label with the input via `useId`.
- Optional public props are declared `| undefined` so consumers using
  `exactOptionalPropertyTypes` can forward optional values.
