# Consuming `@hackert-ui/core` from `@hackert-ui/ui`

How a component in `packages/ui` reads the theme that `AppProvider` resolves,
and what happens to a consumer's `className` and `style` once it does.

## Current state

This note records the design discussion. What shipped:

- **The middle position, not Path A.** `Button` reads the theme through
  context, but its inline `style` carries only `--hui-*` custom properties.
  The rules live in a stylesheet (`packages/ui/src/Button/button-styles.ts`)
  that `Button` renders as a React 19 `<style href precedence>`: hoisted to
  `<head>`, deduped, SSR-safe, no consumer import. It sits in
  `@layer components`, so consumer utilities override it by the normal
  cascade, and `:hover`, `:active`, `:focus-visible` and `:disabled` all work.
  The flip side: any **unlayered** rule beats a layered one, so an app-level
  `button { … }` reset, or Tailwind v3's unlayered preflight, overrides these
  styles.
- **Tailwind v4 is required.** React hoists the `<style>` to the top of
  `<head>`, above the app's stylesheet, and cascade layers rank by first
  declaration. So the stylesheet opens with
  `@layer theme, base, components, utilities;` (Tailwind v4's layer names);
  without it Tailwind's `base` preflight would outrank `components` and reset
  the button. That line fixes the layer order for the whole page. An app with
  other layer names (Panda CSS, a custom `@layer reset, …` scheme) gets
  Tailwind's four layers ranked first, ahead of its own, so its own layers can
  end up overriding the wrong things. Tailwind v3 is unsupported too: its
  preflight is unlayered and beats these styles.
- **Dark mode follows CSS `color-scheme`.** The theme has a `dark.colors`
  palette. `Button` sets each `--hui-*` colour to `light-dark(<light>, <dark>)`,
  so the browser picks one from the page's `color-scheme`: no React state, no
  pre-paint script in the library, correct server-rendered markup. In dark mode
  hover and press lighten. A `.dark` class toggle needs
  `.dark { color-scheme: dark }`. Requires `light-dark()` (Baseline 2024).
- **Foreground gap: closed by derivation, not tokens.** `core`'s
  `useVariantColors(variant)` parses the theme colour (hex, `rgb()` or
  `oklch()`; anything else throws) and derives text, hover and active colours
  for WCAG contrast. See `packages/core/src/theme/color.ts`.
- **Duplicate core: cannot split the context.** `ThemeContext` is stored on
  `globalThis` under `Symbol.for("@hackert-ui/core/ThemeContext")`, so every
  copy shares it, and a copy loaded from a different file logs a
  `console.error`. The build never bundles `@hackert-ui/*`, and the smoke test
  asserts `ui`'s dist imports core.
- **`0.x` peer ranges: decided.** Packages version in lockstep (Changesets
  `fixed`), and internal peers are `>=0.0.0 <1.0.0` with
  `onlyUpdatePeerDependentsWhenOutOfRange`, so a minor stays a minor.

The sections below are the original analysis and describe the code before
these changes.

## What `core` exposes today

`packages/core/src/AppProvider/AppProvider.tsx` holds a module-private
`ThemeContext` and two readers:

| Export              | Behaviour outside `AppProvider` | Exported from `core/src/index.ts` |
| ------------------- | ------------------------------- | --------------------------------- |
| `useAppTheme()`     | throws                          | yes                               |
| `useSafeAppTheme()` | falls back to `DEFAULT_THEME`   | **no**                            |

`resolveTheme` merges an `AppThemeOverride` one leaf at a time over the parent
theme and freezes the result, so a nested `AppProvider` inherits everything it
does not restate. The resolved value is plain CSS strings — `"#2563eb"`,
`"8px"`, `"Inter, sans-serif"` — which is what makes it usable directly as a
style value with no runtime in between.

The token surface is `colors` (5 keys), `radius` and `spacing` (`xs`…`2xl`),
and `fontFamily`. There is **no foreground/contrast token**, which matters the
moment a button paints a background — see [Gaps](#gaps-in-the-token-set).

## The dependency decision comes first

`packages/ui/package.json` does not depend on `@hackert-ui/core` at all today.
Adding the import is the easy half; declaring the dependency correctly is the
half that breaks in a consumer's project rather than in this repo.

React context identity is per module instance. If a consumer ends up with two
copies of `@hackert-ui/core` — one they installed, one bundled inside
`@hackert-ui/ui` — then `AppProvider` writes to one `ThemeContext` and `Button`
reads from a different one. With `useSafeAppTheme` that fails silently: every
component renders `DEFAULT_THEME` and ignores the override.

tsdown externalises `dependencies`, `peerDependencies`, `peerDependenciesMeta`
and `optionalDependencies`, and bundles everything else — verified in
`node_modules/tsdown/dist/deps-B_uZzM4C.mjs:287`. A `devDependencies`-only entry
is therefore the bug above, compiled in.

Mirror the shape `ui` already uses for React:

```jsonc
// packages/ui/package.json
"peerDependencies": {
  "@hackert-ui/core": "^0.1.0",
  "react": "^19.0.0"
},
"devDependencies": {
  "@hackert-ui/core": "workspace:*",
  "react": "19.2.8"
}
```

The peer entry is the contract and keeps the import external. The dev entry is
what makes the source-first `exports` map resolve during `pnpm dev:playground`
and `tsc -p packages/ui/tsconfig.json`; without it the import does not typecheck
inside the workspace.

Belt and braces, `tsdown.config.ts` can also list it:

```ts
deps: {
  neverBundle: [/^react(?:\/.*)?$/, /^react-dom(?:\/.*)?$/, /^@hackert-ui\//],
}
```

**Version range hazard.** A caret on a `0.x` version is strict: `^0.1.0` means
`>=0.1.0 <0.2.0`, so the first minor bump of `core` makes every published `ui`
unsatisfiable. `.changeset/config.json` sets `updateInternalDependencies` to
`"patch"` with empty `fixed`/`linked` arrays, so decide before the first release
whether these packages version in lockstep (`linked`) or the peer range widens
to `>=0.1.0`.

## Path A — read the theme through context

**Reading the theme through context is settled** — it is how a component gets
the resolved theme, and it is what the peer dependency above pays for. The open
question is only what the component then does with those values: writes them as
final CSS properties (this section), writes them as CSS variables (the
[middle position](#path-b--css-custom-properties)), or does not read context at
all because `AppProvider` publishes variables itself (true Path B, the only
option that removes the peer dependency).

Start here. It is the smallest step that makes `Button` theme-aware, needs no
build-pipeline decision, and leaves `AppProvider` rendering no DOM. Its ceiling
is real and documented below.

Components use `useSafeAppTheme`, never `useAppTheme`. A library primitive that
throws because the consumer did not wrap their tree is a hostile default; the
throwing variant is for application code that genuinely requires the provider.

```tsx
// packages/ui/src/Button/Button.tsx
import { type AppColorTheme, useSafeAppTheme } from "@hackert-ui/core";
import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from "react";
import { cx } from "../cx";

export type ButtonVariant = keyof AppColorTheme;
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  readonly children: ReactNode;
  readonly variant?: ButtonVariant | undefined;
  readonly size?: ButtonSize | undefined;
}

const SIZE_PADDING = {
  sm: ["xs", "sm"],
  md: ["sm", "md"],
  lg: ["md", "lg"],
} as const;

export function Button({
  type = "button",
  variant = "primary",
  size = "md",
  className,
  style,
  children,
  ...buttonProps
}: ButtonProps) {
  const theme = useSafeAppTheme();
  const [block, inline] = SIZE_PADDING[size];

  const themed: CSSProperties = {
    backgroundColor: theme.colors[variant],
    borderRadius: theme.radius.md,
    fontFamily: theme.fontFamily,
    padding: `${theme.spacing[block]} ${theme.spacing[inline]}`,
    border: "none",
  };

  return (
    <button
      {...buttonProps}
      type={type}
      className={cx("hui-button", className)}
      style={{ ...themed, ...style }}
    >
      {children}
    </button>
  );
}
```

It deliberately sets no `color`. The theme has no foreground token, and
hardcoding one ships a contrast failure on `warning` — see
[Gaps](#gaps-in-the-token-set). Inheriting is the honest placeholder until that
decision is made.

`hui-button` carries no rule and is not a styling mechanism. It is a stable
selector so a consumer can reach every button from their own stylesheet, and the
anchor a stylesheet would attach to later. That is the difference between it and
`px-2 py-1`, which claims to style the component and silently fails to.

Three things in that signature are load-bearing.

**`variant` is keyed off the token type, not a hand-written union.**
`keyof AppColorTheme` means adding `info` to `AppColorTheme` extends every
component's variant set with no edit here, and removing one is a type error at
every call site. This is the lookup-table form: a frozen token record indexed by
a prop, rather than a `if (variant === "primary") … else if …` chain that has to
be repeated in `Card`, `Input`, and everything after them. `SIZE_PADDING` is the
same idea for a scale the theme does not name directly.

**Optional public props carry `| undefined`.** `tsconfig.base.json` enables
`exactOptionalPropertyTypes`, so `variant?: ButtonVariant` alone stops a
consumer forwarding an optional variable. The repo already documents this
convention on `AppProviderProps.theme`.

**`{...buttonProps}` comes first.** See below.

### `cx`

Two lines, private to the package:

```ts
// packages/ui/src/cx.ts
export function cx(...values: readonly (string | false | null | undefined)[]): string {
  return values.filter(Boolean).join(" ");
}
```

Do not reach for `clsx` or `tailwind-merge`. `tailwind-merge` exists to
de-conflict competing utility classes; once the package stops shipping utility
classes (next section) there is nothing to de-conflict, and it would be a
runtime dependency on a styling framework this library does not otherwise
require.

`@hackert-ui/utils` is the tempting home for it, but `IMPLEMENTATION.md` Stage 5
deliberately left that package's public API empty because giving it a first
export is a semver decision. Do not spend that decision on a two-line helper.

Note that `packages/ui/src/index.ts` re-exports its component barrels with
`export *`, so anything added to `Button/index.ts` becomes public API. Keep `cx`
out of the barrel.

### The same treatment applies to `form`

`@hackert-ui/form`'s `Input` is in an identical position — a React peer only, no
`core` dependency, no styling. Everything above transfers unchanged: the peer +
dev dependency pair, `useSafeAppTheme` over `useAppTheme`, rest-props-first
spread, the `cx` merge. `Input` renders a wrapper `div` and a `label`, so it has
more elements to distribute tokens across, and its markup is asserted in the
same smoke fixture (`scripts/verify-published-packages.mjs`, the `/<label for=/`
match) — that assertion is markup-sensitive in the same way as `Button`'s.

## The `className` and `style` contract

### `px-2 py-1` is a packaging bug

`Button` currently hardcodes `className="px-2 py-1"`. Those Tailwind utilities
resolve in the playground only because Tailwind v4 scans workspace source. A
consumer who installs `@hackert-ui/ui` from npm without Tailwind gets a `class`
attribute that matches no rule — the button renders unpadded. The published
build already carries it:

```
$ node --input-type=module -e '…renderToStaticMarkup(h(Card, null, h(Button, null, "#2563eb")))'
<div><button type="button" class="px-2 py-1">#2563eb</button></div>
```

Once the component's own appearance comes from tokens, `className` stops being
something the component competes for and becomes purely the consumer's escape
hatch. That is what makes plain concatenation sufficient.

### Spread order

The current component spreads `{...buttonProps}` _after_ `className`, so a
consumer's `className` silently replaces the built-in one rather than adding to
it. The target shape inverts it: rest props first, then every prop the component
controls, so `className` and `style` cannot be clobbered by accident and the
merge is explicit.

- `className` — **additive**. `cx("hui-button", className)`.
- `style` — **consumer wins**, via `{ ...themed, ...style }`.

### The specificity trap

This is the honest limit of Path A. An inline `style` attribute beats any class
selector, so a consumer's class cannot override a property the component paints
inline:

| Consumer writes                            | Result                                                |
| ------------------------------------------ | ----------------------------------------------------- |
| `<Button className="tracking-wide" />`     | works — component sets no `letter-spacing`            |
| `<Button style={{ borderRadius: 0 }} />`   | works — spread order gives the consumer the last word |
| `<Button className="rounded-none" />`      | **class applies, inline `border-radius` still wins**  |
| `<Button className="hover:bg-blue-700" />` | **no effect** — see below                             |

And the sharper limit: **inline styles cannot express `:hover`,
`:focus-visible`, `:disabled`, or a media query.** A themed button with no hover
or focus state is not a finished button, and no amount of context plumbing fixes
that — it needs a stylesheet.

Two ways out, in increasing order of cost:

1. Accept it for now. Primitives are described as "intentionally unstyled today"
   in `apps/playground/src/routes/ui.tsx`; states can wait.
2. Move to the variable bridge below.

## Path B — CSS custom properties

The scaling answer, and worth understanding before Path A hardens into
assumptions.

`AppProvider` emits the resolved theme as custom properties; components style
themselves in a stylesheet against `var(--hui-color-primary)`. What that buys:

- `:hover`, `:focus-visible`, `:disabled` and media queries all work, because
  the component's appearance lives in CSS rather than in an attribute.
- Consumer `className` composes by the normal cascade instead of losing to
  inline specificity.
- **`ui` needs no dependency on `core` at all.** No peer range to maintain, no
  duplicate-context hazard, no version-lockstep decision. The contract between
  the packages becomes a set of documented variable names.
- Theme changes repaint without re-rendering the React tree.

What it costs, stated plainly:

- **`AppProvider` currently renders no DOM element.** It returns
  `<ThemeContext value={…}>{children}</ThemeContext>`. Emitting variables means
  rendering a wrapper `<div>` (changes SSR markup and every consumer's layout
  assumptions) or writing to `document.documentElement` in an effect (no SSR,
  flash of default theme, and two providers on one page fight over one target).
- The wrapper element changes rendered markup, so the smoke assertion in
  `scripts/verify-published-packages.mjs:107` has to change with it.
- Components need a stylesheet shipped from the package. `tsdown.config.ts` is
  ESM-only with no CSS pipeline, and all packages declare `sideEffects: false`,
  which makes a bare `import "./styles.css"` droppable by a bundler. This is a
  build decision, not a component edit.

There is a middle position that keeps most of the benefit: the component reads
the theme through context as in Path A, but writes it into **CSS variables**
rather than final properties —

```tsx
style={{ "--hui-button-bg": theme.colors[variant], ...style } as CSSProperties}
```

— and its actual appearance lives in a `.hui-button` class that references those
variables. Because the inline attribute now carries only variable definitions,
it no longer wins the specificity fight over `background-color`, so a consumer's
class _can_ override it, and `:hover` works. It still requires shipping CSS, so
it inherits that part of Path B's cost.

## Testing

Follow `packages/core/src/AppProvider/AppProvider.test.tsx` exactly —
`afterEach(cleanup)` and Testing Library. `packages/ui` has no tests today, but
its `vitest.config.ts` re-exports the shared config, whose
`include: ["src/**/*.test.{ts,tsx}"]` picks up a new file with no config change.
That shared config also sets `environment: "jsdom"` globally, so the
`// @vitest-environment jsdom` pragma on the existing test is convention rather
than necessity; keep it for consistency.

```tsx
// @vitest-environment jsdom

import { AppProvider } from "@hackert-ui/core";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Button } from "./Button";

afterEach(cleanup);

describe("Button", () => {
  it("paints the resolved theme colour for its variant", () => {
    render(
      <AppProvider theme={{ colors: { primary: "rgb(0, 0, 0)" } }}>
        <Button>Save</Button>
      </AppProvider>,
    );

    expect(screen.getByRole("button")).toHaveStyle({
      backgroundColor: "rgb(0, 0, 0)",
    });
  });

  it("renders the default theme without a provider", () => {
    render(<Button>Save</Button>);

    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("keeps the consumer's className alongside its own", () => {
    render(<Button className="mt-4">Save</Button>);

    expect(screen.getByRole("button")).toHaveClass("hui-button", "mt-4");
  });
});
```

`toHaveStyle` and `toHaveClass` come from `@testing-library/jest-dom`, which is
**not** currently a dependency — and adding it is not just a `pnpm add`, since
`vitest.shared.ts` declares no `setupFiles` to register the matchers. Either do
both, or assert on `element.style.backgroundColor` and `element.className`
directly and leave the test setup alone.

The second test is the one that earns its place: it is the regression guard for
the duplicate-context bug, and the reason components use `useSafeAppTheme`.

## Gaps in the token set

`AppTheme` has no foreground colour, which is why the `Button` above sets none.
The obvious placeholder — `color: "#ffffff"` — fails contrast against
`warning: "#f59e0b"` at any reasonable target, so it is not a placeholder worth
shipping. Options, in order of how much they commit:

1. Hardcode white and accept the contrast failure on `warning` (not
   recommended — it ships an accessibility defect).
2. Derive the foreground from the background luminance at render time. No API
   change, but it is logic that belongs in `@hackert-ui/utils` and is the kind
   of "clever" that surprises people later.
3. Add a foreground token per colour — `AppColorTheme` becomes a record of
   `{ base, foreground }` or gains a parallel `foregroundColors` group. Cleanest,
   and a breaking change to a published type.

This needs a decision before `Button` paints anything.

## Changes requiring approval

None of these are applied.

1. **Export `useSafeAppTheme` from `packages/core/src/index.ts`.** Required for
   Path A. It is currently module-private, so promoting it makes the name and
   its fallback behaviour a semver commitment. It is also written as
   `const useSafeAppTheme = () =>` while its neighbour `useAppTheme` is a
   `function` declaration; convert it on promotion.
2. **`scripts/verify-published-packages.mjs:91`** asserts core's sorted export
   keys are exactly `["AppProvider", "DEFAULT_THEME", "useAppTheme"]`. Adding an
   export fails that assertion until it is updated.
3. **`scripts/verify-published-packages.mjs:107`** asserts `Button`'s exact
   rendered markup. Any change to the attributes it renders must land in the
   same commit.
4. **`packages/ui/package.json`** gains the `@hackert-ui/core` peer + dev entry,
   and the version-range strategy from the first section gets decided.
5. **A `variant` / `size` public API on `Button`** is an additive but permanent
   surface. Confirm the prop names before they are published.
6. **A foreground-colour decision**, per the section above.
7. **`@testing-library/jest-dom`** as a root devDependency _plus_ a
   `setupFiles` entry in `vitest.shared.ts`, or matcher-free assertions in the
   new tests.

## Known-broken gate

`pnpm test:published` fails on `main` today, before any of this:

```
actual:   '<div><button type="button" class="px-2 py-1">#2563eb</button></div>'
expected: '<div><button type="button">#2563eb</button></div>'
```

`Button` gained `className="px-2 py-1"` without the smoke assertion in
`scripts/verify-published-packages.mjs` being updated to match. Whichever path
above is taken rewrites that line anyway, but it is failing now for a reason
unrelated to theming and should not be mistaken for fallout from this work.
