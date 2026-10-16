# hackert-ui

A personal React component library, split into packages so a project takes only what it needs.

| Package               | What it holds                                         |
| --------------------- | ----------------------------------------------------- |
| `@hackert-ui/core`    | `AppProvider`, theme resolution, design tokens         |
| `@hackert-ui/ui`      | Component primitives — `Button`, `Card`                |
| `@hackert-ui/form`    | Form controls — `Input`                                |
| `@hackert-ui/hooks`   | React hooks — `useDisclosure`                          |
| `@hackert-ui/utils`   | Framework-agnostic helpers (no React dependency)       |

## Getting started

```sh
pnpm install
pnpm dev:playground   # showcase site on http://localhost:3000
pnpm dev:packages     # rebuild packages on change
```

The playground resolves `@hackert-ui/*` to TypeScript **source**, so editing a
component hot-reloads without a package build. `pnpm dev:packages` is only
needed when you want to inspect `dist` output.

## Verifying

```sh
pnpm verify
```

Runs, in order: `lint` → `typecheck` → `test` → `build` → `test:published`.

`test:published` is the one that matters most for a library. It packs every
package the way `pnpm publish` would, installs the tarballs into a throwaway
project outside the workspace, and renders them through `react-dom/server`. A
broken `exports` map or a missing peer dependency fails there rather than in a
consuming project.

## How package exports work

Each package declares source paths in `exports` and real `dist` paths in
`publishConfig`. `pnpm pack` swaps one for the other, so:

- **inside the workspace** — consumers get TypeScript source and instant HMR
- **on npm** — consumers get built ESM plus declarations

Nothing needs to be built before the playground runs.

## Releasing

Versioning is handled by [Changesets](https://github.com/changesets/changesets).

```sh
pnpm changeset          # describe the change, pick the bump
git push                # CI opens a "Version Packages" PR
```

Merging that PR publishes to npm.

**Publishing is not live yet.** Two external steps are required first:

1. Claim the `@hackert-ui` scope on npm.
2. Add an automation token as the `NPM_TOKEN` repository secret.

## Deploying the playground

The playground deploys to Vercel from the repository root. `vercel.json` holds
the install and build commands, the output directory, and the catch-all rewrite
that keeps deep links working on a client-side router — Vercel checks the
filesystem before rewriting, so hashed assets still serve normally.

Point a Vercel project at this repo and leave **Root Directory** as the repo
root, so the workspace packages resolve. Set the project's Node version to 22.18
or newer, or 24.11 or newer: `.npmrc` sets `engine-strict=true`, so anything
outside `engines.node` fails the install outright instead of warning. Everything
else lives in `vercel.json`.

## Adding a component

1. Create `packages/<pkg>/src/<Name>/<Name>.tsx` plus an `index.ts` barrel.
2. Re-export it from `packages/<pkg>/src/index.ts` as a **named** export —
   avoid `export *`, which silently promotes internals into the public API you
   are then bound to by semver.
3. Add `<Name>.test.tsx` beside it.
4. Add a demo route in `apps/playground/src/routes/`.
5. `pnpm changeset`.
