# Hackert UI — monorepo hardening

## Stage 1: Workspace + tooling hygiene

**Goal**: One workspace root, one TypeScript, one linter.
**Success Criteria**: `pnpm install` from any directory resolves `@hackert-ui/*`; no duplicate lockfiles; `pnpm lint` runs at root.
**Tests**: `pnpm --filter playground exec tsc --noEmit` passes without re-installing.
**Status**: Completed

- Delete `apps/playground/pnpm-workspace.yaml` + `apps/playground/pnpm-lock.yaml`, hoisting `allowBuilds` to the root workspace file.
- Drop the dead `pnpm.onlyBuiltDependencies` field from the playground manifest (pnpm 11 ignores it).
- Unify TypeScript on one version across root + playground.
- Remove the unused `eslint` dependency; hoist Biome to the root and widen its `includes`.
- Remove `trust-lockfile` duplication between `.npmrc` and `pnpm-workspace.yaml`.

## Stage 2: Publishable packages (bare minimum)

**Goal**: Every package can be `pnpm publish`ed and consumed outside this repo.
**Success Criteria**: `pnpm pack` in each package emits a tarball whose `exports` point at `dist`.
**Tests**: Extend `scripts/verify-react-peers.mjs` to cover every package.
**Status**: Completed

- Remove `private: true` from `ui`, `form`, `hooks`, `utils`.
- Add `main`, `types`, `license`, `repository`, `publishConfig.access` to each.
- Declare the React peer on `form` and `hooks` (both import React today).
- Source-first `exports` with a `publishConfig.exports` rewrite to `dist` so the playground gets HMR while the tarball stays correct.
- Curate the public API: stop `export *` promoting internals (`tokens`, `resolveTheme`).

## Stage 3: Typecheck + tests across the workspace

**Goal**: `pnpm verify` is green and actually covers all six packages.
**Success Criteria**: `typecheck` and `test` scripts exist and pass in every package.
**Tests**: `pnpm verify` exits 0.
**Status**: Completed

- Shared vitest config with the jsdom environment (fixes the 3 failing hooks tests).
- Fix `test/consumer/smoke.mjs` export assertion.
- Fix `useDisclosure` so callbacks accompany state updates instead of suppressing them; rewrite the test that certifies the bug.
- `Card` children → `ReactNode`; optional public props get `| undefined` for `exactOptionalPropertyTypes` consumers.
- Delete empty stub files (`Stack.*`, empty `*.test.tsx`, `packages/hooks/index.ts`).

## Stage 4: CI + release path

**Goal**: PRs are verified; merges to `main` publish to npm.
**Success Criteria**: CI workflow runs `pnpm verify`; a changeset merge opens a release PR.
**Tests**: `pnpm exec changeset status` resolves; workflows pass actionlint-style review.
**Status**: Completed

- Changesets init, configured for the `@hackert-ui` scope.
- `.github/workflows/ci.yml` — install, typecheck, test, build on PR + push.
- `.github/workflows/release.yml` — changesets action, publish with provenance.

## Stage 5: Playground as public showcase

**Goal**: A deployable site demonstrating every component.
**Success Criteria**: `pnpm build:playground` produces a deployable site importing from all five packages.
**Tests**: Playground typechecks and builds.
**Status**: Completed

- `AppProvider` moves to `__root.tsx`.
- Demo routes exercising each package.
- Static deploy config — Vercel, driven from `vercel.json` at the repo root.

`@hackert-ui/utils` has no demo route; its overview card is non-navigational
instead of linking back to `/`, which was a dead self-link. `cn` is exercised
by every themed `Button` the playground renders.
