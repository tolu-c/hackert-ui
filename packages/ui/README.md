# @hackert-ui/ui

Component primitives: `Button`, `Card`, `CloseButton`, `Loader`, `Skeleton`,
`Modal` (with `Modal.Stack`), and notifications (`<Notifications />`,
`notifications.show()`, `Notification`).

`Button` takes a `color` (a theme key or any CSS colour) and a `variant`
(`filled`, `light`, `outline`, `subtle`, `transparent` or the neutral `default`),
plus `leftSection`, `rightSection`, `justify`, `fullWidth`, and `loading` with
`loaderProps`.

Also exported, as placeholders that are not implemented yet: `CopyButton`,
`EmptyState` and `Tabs`. They render a stand-in element and their props will
change, so don't build on them yet.

```sh
pnpm add @hackert-ui/ui @hackert-ui/core @hackert-ui/utils
```

Part of [hackert-ui](https://github.com/tolu-c/hackert-ui). Requires React 19 and Tailwind v4, inside `AppProvider` from `@hackert-ui/core`.
All `@hackert-ui/*` packages share one version; install
matching versions.

## License

MIT
