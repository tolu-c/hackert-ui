---
"@hackert-ui/core": minor
"@hackert-ui/ui": minor
"@hackert-ui/form": minor
---

**Breaking:** Button's theme colour moves from `variant` to `color`, and `variant` now picks the style.

Migrate by renaming the prop: `<Button variant="danger">` becomes `<Button color="danger">`. `SubmitButton` takes the same props.

- `color` takes a theme key (default `primary`) or any CSS colour: a name such as `tomato`, hex, `rgb()` or `oklch()`.
- `variant` is `filled` (default), `light`, `outline`, `subtle`, `transparent` or `default`. `default` is a neutral bordered button that ignores `color`.
- New props: `leftSection` and `rightSection`, `justify` (`center` or `space-between`), and `fullWidth`.
- While `loading`, the label is covered by a `Loader` spinner instead of the button greying out. The button keeps its width and colours, and it stays disabled with `aria-busy`. Pass `loaderProps` to choose the spinner.
- Button text is now medium weight. Every variant draws a 1px border (transparent when unused), so mixed variants line up.
- `@hackert-ui/core`: `useVariantColors(color)` and `deriveVariantColors` take a theme key or any CSS colour, and they parse CSS colour names. The result adds `text` (the colour adjusted to be readable on the page) plus `lightBackground` and `lightHoverBackground` (translucent tints). Error messages now name the colour rather than a "variant".
