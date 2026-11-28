---
"@hackert-ui/core": minor
"@hackert-ui/ui": minor
---

`Loader` and `Skeleton` are implemented.

- `Loader` draws a spinning `oval` (default), bouncing `bars` or pulsing `dots`. `size` takes a size key (`xs` 18px to `2xl` 72px) or a number of pixels. `color` takes a theme key or any CSS colour and defaults to the surrounding text colour. It renders `role="status"` with an `aria-label` of "Loading".
- `Skeleton` is a pulsing placeholder sized by `height`, `width` (numbers are pixels), `radius` (a radius key or CSS value) and `circle`. Wrap real content and toggle `visible`: the placeholder takes the content's size and covers it, and the content stays mounted underneath. Turn the pulse off with `animate={false}`.
- `@hackert-ui/core` exports `AppColor` (a theme key or any CSS colour), `isThemeColor`, `schemeColors` and `byScheme`.
