# @hackert-ui/ui

## 0.2.1

First release of these changes. The `v0.2.0` release published nothing: npm
already had 0.2.0, the build published by mistake before 0.0.1.

### Minor Changes

- ca4dab4: **Breaking:** Button's theme colour moves from `variant` to `color`, and `variant` now picks the style.

  Migrate by renaming the prop: `<Button variant="danger">` becomes `<Button color="danger">`. `SubmitButton` takes the same props.

  - `color` takes a theme key (default `primary`) or any CSS colour: a name such as `tomato`, hex, `rgb()` or `oklch()`.
  - `variant` is `filled` (default), `light`, `outline`, `subtle`, `transparent` or `default`. `default` is a neutral bordered button that ignores `color`.
  - New props: `leftSection` and `rightSection`, `justify` (`center` or `space-between`), and `fullWidth`.
  - While `loading`, the label is covered by a `Loader` spinner instead of the button greying out. The button keeps its width and colours, and it stays disabled with `aria-busy`. Pass `loaderProps` to choose the spinner.
  - Button text is now medium weight. Every variant draws a 1px border (transparent when unused), so mixed variants line up.
  - `@hackert-ui/core`: `useVariantColors(color)` and `deriveVariantColors` take a theme key or any CSS colour, and they parse CSS colour names. The result adds `text` (the colour adjusted to be readable on the page) plus `lightBackground` and `lightHoverBackground` (translucent tints). Error messages now name the colour rather than a "variant".

- 41e9203: `Loader` and `Skeleton` are implemented.

  - `Loader` draws a spinning `oval` (default), bouncing `bars` or pulsing `dots`. `size` takes a size key (`xs` 18px to `2xl` 72px) or a number of pixels. `color` takes a theme key or any CSS colour and defaults to the surrounding text colour. It renders `role="status"` with an `aria-label` of "Loading".
  - `Skeleton` is a pulsing placeholder sized by `height`, `width` (numbers are pixels), `radius` (a radius key or CSS value) and `circle`. Wrap real content and toggle `visible`: the placeholder takes the content's size and covers it, and the content stays mounted underneath. Turn the pulse off with `animate={false}`.
  - `@hackert-ui/core` exports `AppColor` (a theme key or any CSS colour), `isThemeColor`, `schemeColors` and `byScheme`.

- 9c4743c: `Modal`, `CloseButton` and `useModalsStack` are implemented.

  - `Modal` is built on the native `<dialog>` element, opened with `showModal()`. The browser traps focus and makes the page inert, and the page behind is scroll-locked. The modal grows with its content up to 75dvh. Past that, the header stays fixed and only the body scrolls. Props: `opened`, `onClose`, `title`, `description`, `size` (`xs`–`xl`, default `lg`; `auto` fits the content; a CSS width such as `"70%"`, or pixels), `centered`, `withCloseButton`, `closeButtonProps`, `closeOnEscape`, `closeOnClickOutside` and `radius`. Escape and backdrop clicks call `onClose` rather than closing the dialog themselves. Style the backdrop with Tailwind's `backdrop:` variant.
  - Compound parts give full control: `Modal.Root`, `Modal.Header`, `Modal.Title`, `Modal.Description`, `Modal.CloseButton` and `Modal.Body`. `Modal.Title` and `Modal.Description` label and describe the dialog.
  - `Modal.Stack` groups modals that pass a `stackId`. Only the most recently opened one is shown over the backdrop, and closing it reveals the one beneath.
  - `CloseButton` is an X icon button named "Close", with `size` and an overridable icon (`children`) and label (`aria-label`).
  - `@hackert-ui/hooks`: `useModalsStack(ids)` returns `state`, `open`, `close`, `toggle`, `closeAll` and `register(id)`, which spreads onto a `Modal` inside `Modal.Stack`.

- 73e83b0: Notifications are implemented.

  - Mount `<Notifications />` once, then call `notifications.show({ title, message, color, icon, loading, autoClose, withCloseButton, onClose })` from anywhere, including outside React. `show` returns an id for `notifications.update(id, data)` and `notifications.hide(id)`; `notifications.clean()` hides them all. Showing an existing id updates it in place.
  - Notifications close after 4 seconds by default (`autoClose: false` keeps one open). They don't close while `loading`, and an update restarts the timer. Every timer pauses while the pointer is over the stack, while focus is inside it, and while the tab is hidden.
  - `<Notifications position limit zIndex />` takes six positions (default `bottom-right`). The newest notification sits nearest the screen edge, and any beyond `limit` (default 5) wait their turn. Entries and exits animate, and neighbours slide into place.
  - `<Notification />` is the card on its own: a colour bar, or an icon, or a spinner while `loading`, plus a title, a message and a close button.
  - `useNotify()` returns the `notifications` API, and `useNotifications()` returns the live list for custom rendering.
  - `react-dom` is now a peer dependency of `@hackert-ui/ui`.

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
