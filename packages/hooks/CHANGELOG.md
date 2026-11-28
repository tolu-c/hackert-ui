# @hackert-ui/hooks

## 0.2.1

First release of these changes. The `v0.2.0` release published nothing: npm
already had 0.2.0, the build published by mistake before 0.0.1.

### Minor Changes

- 9c4743c: `Modal`, `CloseButton` and `useModalsStack` are implemented.

  - `Modal` is built on the native `<dialog>` element, opened with `showModal()`. The browser traps focus and makes the page inert, and the page behind is scroll-locked. The modal grows with its content up to 75dvh. Past that, the header stays fixed and only the body scrolls. Props: `opened`, `onClose`, `title`, `description`, `size` (`xs`–`xl`, default `lg`; `auto` fits the content; a CSS width such as `"70%"`, or pixels), `centered`, `withCloseButton`, `closeButtonProps`, `closeOnEscape`, `closeOnClickOutside` and `radius`. Escape and backdrop clicks call `onClose` rather than closing the dialog themselves. Style the backdrop with Tailwind's `backdrop:` variant.
  - Compound parts give full control: `Modal.Root`, `Modal.Header`, `Modal.Title`, `Modal.Description`, `Modal.CloseButton` and `Modal.Body`. `Modal.Title` and `Modal.Description` label and describe the dialog.
  - `Modal.Stack` groups modals that pass a `stackId`. Only the most recently opened one is shown over the backdrop, and closing it reveals the one beneath.
  - `CloseButton` is an X icon button named "Close", with `size` and an overridable icon (`children`) and label (`aria-label`).
  - `@hackert-ui/hooks`: `useModalsStack(ids)` returns `state`, `open`, `close`, `toggle`, `closeAll` and `register(id)`, which spreads onto a `Modal` inside `Modal.Stack`.

## 0.1.0

### Minor Changes

- 6a4393c: Add `useCopy` and `useClickOutside`. `useCopy` copies text to the clipboard and reports `isCopied` for a moment (`timeout`, default 1000ms); it does nothing when the Clipboard API is missing. `useClickOutside` returns a ref and calls back on a mousedown or touchstart outside that element.

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
