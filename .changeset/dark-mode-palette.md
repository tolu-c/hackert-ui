---
"@hackert-ui/core": patch
"@hackert-ui/ui": patch
---

Dark mode.

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
