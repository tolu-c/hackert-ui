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
- Internal peer range: widened to `>=0.1.0 <1.0.0` rather than releasing 1.0.0.
