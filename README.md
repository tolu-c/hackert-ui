# hackert-ui

A personal React component library, split into packages so a project takes only what it needs.

| Package             | What it holds                                                    |
| ------------------- | ---------------------------------------------------------------- |
| `@hackert-ui/core`  | `AppProvider`, theme resolution, design tokens                   |
| `@hackert-ui/ui`    | Component primitives — `Button`, `Card`                          |
| `@hackert-ui/form`  | Form controls — `Input`                                          |
| `@hackert-ui/hooks` | React hooks — `useDisclosure`, `useDebouncedValue`               |
| `@hackert-ui/utils` | Framework-agnostic helpers — `cn` (no React dependency)          |
| `@hackert-ui/dates` | Date components — `DateInput` (placeholder, not yet implemented) |

`apps/playground` is the showcase site. It demos every package except
`dates`, which has nothing to show yet.

## Requirements

- **Node** `^22.18.0` or `>=24.11.0`. `.node-version` pins `24.11.0`, and
  `.npmrc` sets `engine-strict=true`, so any other version fails the install.
- **pnpm** `11.22.0`, as pinned by `packageManager`. Run `corepack enable` to
  get the right version automatically. Do not use `npm install`; it breaks the
  workspace links.

## Getting started

```sh
pnpm install
pnpm dev:playground   # showcase site on http://localhost:3000
```

`pnpm install` also runs `vp config`, which installs the Git hooks (see
[Toolchain](#toolchain)).

The playground resolves `@hackert-ui/*` to TypeScript **source**, so editing a
component hot-reloads without building anything. Run `pnpm dev:packages` only
when you want to inspect the `dist` output.

## Scripts

Run these from the repository root.

| Script                  | What it does                                                      |
| ----------------------- | ----------------------------------------------------------------- |
| `pnpm dev:playground`   | Start the playground dev server on port 3000                      |
| `pnpm dev:packages`     | Rebuild every package's `dist` on change                          |
| `pnpm build`            | Build all packages, then the playground                           |
| `pnpm build:packages`   | Build each package with `vp pack` (ESM + `.d.ts`)                 |
| `pnpm build:playground` | Build the playground into `apps/playground/dist`                  |
| `pnpm lint`             | Format check, lint and type-aware checks via `vp check`           |
| `pnpm format`           | Same as `lint`, applying every safe fix                           |
| `pnpm typecheck`        | `tsc` in every workspace project                                  |
| `pnpm test`             | Run every package's tests                                         |
| `pnpm test:published`   | Pack, install and smoke-test the packages as npm would ship them  |
| `pnpm verify`           | lint → typecheck → test → build → test:published, as CI runs them |
| `pnpm changeset`        | Record a change for the next release                              |

To work on a single package, filter to it:

```sh
pnpm --filter @hackert-ui/ui test
pnpm --filter @hackert-ui/ui build
```

## Project structure

```
apps/
  playground/          TanStack Router + Tailwind showcase site
packages/
  <name>/
    src/index.ts       the package's public API
    src/<Name>/        one folder per component or hook, with its test
    package.json
    tsconfig.json      extends ../../tsconfig.base.json
    vitest.config.ts   re-exports ../../vitest.shared.ts
scripts/
  verify-published-packages.mjs   the test:published smoke test
docs/                  design notes (THEMING.md)
tsdown.config.ts       shared build config, used by vp pack
vite.config.ts         root Vite+ config: lint, fmt, staged, pack
vitest.shared.ts       shared test config (jsdom)
vercel.json            playground deploy config
```

## Toolchain

The repo uses [Vite+](https://viteplus.dev/) (`vp`), which wraps Vite, Vitest,
tsdown, Oxlint and Oxfmt:

- `vp pack` builds a package with tsdown, using `tsdown.config.ts`.
- `vp test` runs Vitest. Import test APIs from `vite-plus/test`, not `vitest`.
- `vp check` formats with Oxfmt and lints with Oxlint, with type-aware rules.
- `vp dev` / `vp build` run the playground.

A pre-commit hook in `.vite-hooks/` runs `vp check --fix` on staged files.

Formatting is configured in the root `vite.config.ts`. Generated files
(`routeTree.gen.ts`) and `AGENTS.md` are excluded from it.

## How package exports work

Each package declares **source** paths in `exports` and real **`dist`** paths
in `publishConfig`. `pnpm pack` swaps one for the other, so:

- **inside the workspace**, consumers get TypeScript source and instant HMR.
- **on npm**, consumers get built ESM plus type declarations.

Nothing needs to be built before the playground or the tests run.

## Using the packages in an app

```sh
pnpm add @hackert-ui/core @hackert-ui/ui @hackert-ui/utils
```

`@hackert-ui/ui` declares `core`, `utils` and `react` as **peer**
dependencies, so the app installs them itself. That keeps a single copy of
`core`'s theme context. Wrap the tree once:

```tsx
import { AppProvider } from "@hackert-ui/core";
import { Button } from "@hackert-ui/ui";

export function App() {
  return (
    <AppProvider theme={{ colors: { primary: "#0f766e" } }}>
      <Button variant="primary">Save</Button>
    </AppProvider>
  );
}
```

Components fall back to the default theme outside `AppProvider`. See
[`docs/THEMING.md`](docs/THEMING.md) for how theming works and what's still
open.

## Adding a component

1. Create `packages/<pkg>/src/<Name>/<Name>.tsx` and an `index.ts` barrel that
   names its exports, for example
   `export { Button, type ButtonProps } from "./Button";`. Naming them keeps
   internals out of the public API, which you're bound to by semver.
2. Re-export the folder from `packages/<pkg>/src/index.ts`.
3. Add `<Name>.test.tsx` beside it. Use Testing Library, with test APIs
   imported from `vite-plus/test`.
4. Add a demo to the matching route in `apps/playground/src/routes/`.
5. Run `pnpm changeset`.

## Adding a package

1. **Copy an existing package.** `packages/utils` is the smallest. Copy
   `package.json`, `tsconfig.json`, `vitest.config.ts` and `src/index.ts` into
   `packages/<name>/`.
2. **Update `package.json`.** Change `name` (`@hackert-ui/<name>`),
   `description`, `keywords`, `homepage` and `repository.directory`. Reset
   `version` to `0.1.0`. Keep `exports`, `publishConfig` (including
   `"access": "public"`), `files` and `scripts` as they are.
3. **Declare dependencies by how they should ship.** The build bundles
   anything that is not a runtime dependency.
   - `react` and other `@hackert-ui/*` packages go in **`peerDependencies`**
     (for example `"^0.1.0"`), plus the same package in **`devDependencies`**
     as `workspace:*` so it resolves inside the repo.
   - Third-party runtime libraries go in **`dependencies`**.
4. **Install and verify.** Run `pnpm install` to link the package and update
   `pnpm-lock.yaml`, then commit the lockfile. CI installs with
   `--frozen-lockfile`.
5. **Showcase it.** Add `"@hackert-ui/<name>": "workspace:*"` to
   `apps/playground/package.json`, then add a route in
   `apps/playground/src/routes/` and a card in `routes/index.tsx`.
6. **Smoke-test the published build.** `test:published` packs every directory
   under `packages/` automatically. Also import and assert on at least one
   export in the smoke script inside `scripts/verify-published-packages.mjs`.
7. Add the package to the table at the top of this README, then run
   `pnpm changeset` and `pnpm verify`.

## Verifying

```sh
pnpm verify
```

This runs, in order: `lint` → `typecheck` → `test` → `build` →
`test:published`. CI (`.github/workflows/ci.yml`) runs the same steps on every
push and pull request.

`test:published` matters most for a library. It packs every package the way
`pnpm publish` would, installs the tarballs into a throwaway project outside
the workspace, and renders them through `react-dom/server`. A broken `exports`
map or a missing peer dependency fails here, not in a consuming project.

## Releasing

[Changesets](https://github.com/changesets/changesets) handles versioning.

```sh
pnpm changeset          # describe the change and pick the bump
git push                # CI opens a "Version Packages" PR
```

Merging that PR publishes to npm with provenance.

**Publishing isn't live yet.** Two external steps come first:

1. Claim the `@hackert-ui` scope on npm.
2. Add an automation token as the `NPM_TOKEN` repository secret.

## Deploying the playground

The playground deploys to Vercel from the repository root. `vercel.json` holds
the install and build commands, the output directory, and a catch-all rewrite
that keeps deep links working with the client-side router. Vercel checks the
filesystem before rewriting, so hashed assets still serve normally.

Point a Vercel project at this repo and leave **Root Directory** as the repo
root, so the workspace packages resolve. Set the project's Node version to
22.18 or newer, or 24.11 or newer. `engine-strict=true` makes any other version
fail the install. Everything else lives in `vercel.json`.

## License

MIT
