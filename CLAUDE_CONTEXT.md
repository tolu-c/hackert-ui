# Claude context

## Lessons learned

### Cascade layers are ordered by first declaration, not by stylesheet order

React 19 inserts the first `<style precedence>` at the top of `<head>`, before
the app's Tailwind stylesheet. A library stylesheet that only declares
`@layer components` therefore ranks below Tailwind's `base`, and preflight's
`button` reset wins. Fix: start the stylesheet with
`@layer theme, base, components, utilities;`. jsdom does not implement layers,
so this only shows up in a real browser; check with headless Chrome against
`vp preview`.

### Changesets bumps peer dependents to major on any minor

With `^0.x` peers, a minor of `core` falls out of range and `ui` goes major,
and a `fixed` group spreads that to every package. `workspace:^` does not
help (Changesets resolves it to `^<old version>`). What works: internal peers
`>=0.1.0 <1.0.0` plus `onlyUpdatePeerDependentsWhenOutOfRange`. Read the
source (`@changesets/assemble-release-plan`, `shouldBumpMajor`) rather than
guessing config.

### Duplicate-module warnings must not depend on bundler globals

`import.meta.hot` is defined under Vitest and has no types under plain `tsc`.
Comparing `import.meta.url` to the URL that registered the context separates a
real duplicate from an HMR re-run.

### `loader.tsx` is a reserved route file name

TanStack Router's generator treats `loader.tsx` as a code-split loader for its
directory and rewrote `createFileRoute("/ui/loader")` to `"/ui"`. Escape the
segment: `routes/ui/[loader].tsx` serves `/ui/loader`.

### jsdom has no `<dialog>.showModal()`

`packages/ui/vitest.setup.ts` polyfills `showModal`/`close` (open attribute plus
the `close` event). Real top-layer, focus and `::backdrop` behaviour can only be
checked in a browser.

### A fixed `<dialog>` with `height: auto` fills the viewport

With `inset: 0`, `height: auto` stretches; the UA uses `fit-content` for that
reason. A `flex: 1` body inside a fit-content column also collapsed to nothing
(the centred modal cut off its buttons). Fix: `height: fit-content`,
`max-height: 75dvh`, body `flex: 0 1 auto; min-height: 0; overflow-y: auto`.

### Headless Chrome skips focus events unless told otherwise

Blur-driven behaviour (closing a dropdown, showing a field error) did nothing
over CDP until `Emulation.setFocusEmulationEnabled({ enabled: true })`.

### libphonenumber-js `AsYouType` quirks

Partial US input drops parentheses (`"(20"` formats as `"20"`); backspacing over
`)` re-adds it, so PhoneInput deletes the digit before the caret instead; and
`+44 7911 123456` resolves to Guernsey, not the UK. Count `+` with the digits
when restoring the caret, or typing after a leading `+` lands in front of it.

## Decisions and redirections from the user

- Theme colours are derived by a calculator (text, hover and active from one
  colour) rather than explicit foreground tokens. Inputs: hex, `rgb()`,
  `oklch()`; anything else throws.
- "There should not be a scenario where we have two copies of core": a
  fallback that silently renders the default theme is not acceptable. Shared
  `globalThis` context + lockstep versions + a build guard.
- Most consuming apps use Tailwind, but library styling must not require it
  (`cursor-pointer` moved into the stylesheet; `cursorPointer` prop removed).
- Library CSS is delivered via a React 19 hoisted `<style>`, not a shipped
  `.css` file or Tailwind classes.
- Internal peer range: `>=0.0.0 <1.0.0` rather than releasing 1.0.0.
- Button: `color` (theme key or any CSS colour, names included) is separate from
  `variant` (filled, light, outline, subtle, transparent, default). The user
  chose a clean break over a deprecation shim for `variant="danger"`.
- Loading buttons keep their colours and show a `Loader`; only real `disabled`
  greys out.
- Notifications are built in-house (globalThis store + `useSyncExternalStore`),
  not wrapped around Sonner (user's choice).
- PhoneInput lives in `@hackert-ui/form` and uses `libphonenumber-js` (user's
  choice over a hand-kept country list).
- Invalid form fields colour the label and description too (the user's reading
  of "form errors don't show the appropriate ui visual").
- Modal is a native `<dialog>` with `showModal()`. With `::backdrop` there is no
  `Modal.Overlay`/`Modal.Content`; style the backdrop with Tailwind's
  `backdrop:` variant. `withCloseButton={false}` drops the header only when
  there is no title or description.
- Redirection: the modal must size to its content with a 75dvh cap (the first
  version used `5dvh` offsets for the max height and clipped centred modals).

## Lessons learned (playground)

### A child route's search is merged over the parent's raw search

The root route has no `validateSearch`, so it passes raw URL params down, and
a child's search is `{ ...parentSearch, ...validated }`. A validator that
_omits_ an invalid key lets the raw value through (`?variant=bogus` crashed
Button). Return every declared key with a default instead, and type the input
`Partial<…> & SearchSchemaInput` so links and redirects need no `search`.
Unit-testing the validator alone did not catch it; a real page load did.

### `stripSearchParams` cannot infer inside a generic helper

Its input type is a conditional over the schema, which TypeScript cannot
resolve for a generic `C`. A five-line `SearchMiddleware<T>` that drops keys
equal to their defaults is simpler than fighting the inference.

### Headless Chrome screenshots are not phone-width

`--window-size=390,…` on macOS renders at Chrome's minimum window width
(~500px), which looks like overflow. Use CDP `Emulation.setDeviceMetricsOverride`
and compare `scrollWidth` to `clientWidth` to check mobile layout for real.

## Decisions (playground)

- Mantine-style pages: Usage configurator + example sections, no right TOC.
- Configurator state lives in URL search params (`replace: true`, defaults
  stripped). Variant control is theme swatches only. No dark mode yet.
- Button page keeps only the Disabled state and Custom className examples;
  the configurator covers variants and sizes.
- User asked for commits without a Claude co-author trailer.
- Playground path alias is `@/` (tsconfig `paths`), not `#/`. `#/` came from
  package.json subpath `imports`, which Node requires to start with `#`, so
  `@/` relies on Vite's `resolve.tsconfigPaths`; the playground's
  `vitest.config.ts` enables it too.

## Decisions (tooling)

- Git hooks stay on Vite+ (`vp config` → `.vite-hooks/pre-commit` → `vp staged`
  → `vp check --fix`), which already does what Husky + lint-staged would. The
  user asked for Husky + lint-staged, then kept the Vite+ hooks after hearing
  that Husky would conflict over `core.hooksPath`.
- `.github/workflows/pullfrog.yml` is generated by Pullfrog and marked
  do-not-edit, so it is listed in `fmt.ignorePatterns` instead of being reformatted.
- Tailwind v4 is the only supported consumer setup (asked after Pullfrog flagged
  that the `@layer theme, base, components, utilities;` prelude fixes the host
  page's layer order). The prelude stays; the requirement is documented in
  THEMING.md, README and the changeset rather than engineered around.
- Zod for configurator search validation was considered and not adopted: the
  router merges parent raw search over the validated output, so a schema does
  not stop undeclared params leaking; `pickControls` via `useSearch({ select })` does.
- Publishing runs only on a published GitHub Release (`publish.yml`), not on
  push to `main`. `version.yml` still opens the Changesets "Version Packages"
  PR on `main`; the release tag must be `v<lockstep version>`. The repo is made
  public so npm provenance works.
- Imports stay per package (`@hackert-ui/ui`, `@hackert-ui/form`, …), Mantine
  style. An umbrella `hackert-ui` re-export package was offered and declined.
- Dark mode covers the library and the playground (user's choice). The library
  follows CSS `color-scheme` via `light-dark()` in Button's inline variables,
  chosen over an `AppProvider colorScheme` prop to avoid SSR flashes. Dark
  palette is 400/500 shades, so some variants take dark text by WCAG contrast.
- Playground colours are semantic tokens (`fg`, `line`, `surface`, …) in
  `styles.css` with a `.dark` override; a pre-paint script in `index.html`
  mirrors `src/color-scheme.ts`. Switcher is System / Light / Dark.
- Every package page header shows Installation tabs (pnpm, yarn, npm),
  Mantine style; the chosen manager is shared across pages.
- Logo: three of four rounded tiles forming an "h" (stem + leg), the empty
  corner standing for "take only the packages you need"; the leg is the
  primary blue. `components/Logo.tsx` and `public/favicon.svg` (adapts to OS
  dark mode).
- Page `<title>` and meta description come from `catalog.ts` via `pageHead(to)`
  and `<HeadContent />`; PageHeader reads the same entry, so the lead paragraph
  and meta description cannot drift.

### Merging a Version PR published 0.2.0 by accident

`main` still had the old `release.yml` (publish on Version PR merge) while the
release-triggered `publish.yml` sat in an unmerged PR, so merging the bot's
Version PR published 0.2.0 straight to npm. The user wanted to start at 0.0.1:
0.2.0 is deprecated, versions reset to 0.0.0 with patch changesets so the next
Version PR yields 0.0.1. Lesson: land a workflow change before merging anything
that triggers the old one. 0.2.0 is permanently taken on npm, so 0.1.x must jump
past it (0.2.1+) or go to 1.0.0.

### The v0.2.0 release "succeeded" and published nothing

The Version PR took the packages from 0.1.0 to 0.2.0, which npm already had
(the accidental build above). `changeset publish` only warns ("already published
on npm") and exits 0, so the Publish run was green while `latest` stayed 0.1.0.
Fixed by moving to 0.2.1 (renaming the unreleased CHANGELOG section) and adding a
Publish step that fails when the version is already on npm.
