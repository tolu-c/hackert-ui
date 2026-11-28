// Packs every workspace package the way `pnpm publish` would, installs the
// tarballs into a throwaway project, and renders them through react-dom/server.
// This is what catches a broken `exports` map, a missing peer dependency, or a
// publishConfig rewrite that silently stopped working — none of which the
// in-repo tests can see, because they resolve TypeScript source directly.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packagesRoot = join(repositoryRoot, "packages");
const reactVersions = ["19.0.0", "19.2.8"];

const packageDirectories = await readdir(packagesRoot);
const temporaryDirectory = await mkdtemp(join(tmpdir(), "hackert-ui-verify-"));

function run(command, args, cwd) {
  execFileSync(command, args, { cwd, stdio: "inherit" });
}

try {
  const tarballs = {};

  for (const directory of packageDirectories) {
    const packageDirectory = join(packagesRoot, directory);
    const manifest = JSON.parse(await readFile(join(packageDirectory, "package.json"), "utf8"));

    assert.ok(!manifest.private, `${manifest.name} is marked private and cannot be published`);
    assert.equal(
      manifest.publishConfig?.access,
      "public",
      `${manifest.name} must set publishConfig.access to "public"`,
    );

    const packDestination = join(temporaryDirectory, "tarballs");
    await mkdir(packDestination, { recursive: true });

    const before = new Set(await readdir(packDestination).catch(() => []));
    run("pnpm", ["pack", "--pack-destination", packDestination], packageDirectory);
    const created = (await readdir(packDestination)).find((f) => !before.has(f));
    assert.ok(created, `pnpm pack produced no tarball for ${manifest.name}`);

    tarballs[manifest.name] = join(packDestination, created);
    console.log(`packed ${manifest.name} -> ${created}`);
  }

  for (const version of reactVersions) {
    const fixtureDirectory = join(temporaryDirectory, `react-${version}`);
    await mkdir(fixtureDirectory, { recursive: true });

    const dependencies = {
      react: version,
      "react-dom": version,
      "@tanstack/react-form": "^1.33.5",
    };
    for (const [name, tarball] of Object.entries(tarballs)) {
      dependencies[name] = `file:${tarball}`;
    }

    await writeFile(
      join(fixtureDirectory, "package.json"),
      `${JSON.stringify({ private: true, type: "module", dependencies }, null, 2)}\n`,
    );
    await writeFile(
      join(fixtureDirectory, "smoke.mjs"),
      `import assert from "node:assert/strict";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AppProvider, DEFAULT_THEME, useAppTheme } from "@hackert-ui/core";
import { Button, Card, Loader, Modal, Notifications } from "@hackert-ui/ui";
import { FormField, useAppForm } from "@hackert-ui/form";
import { useDebouncedValue, useDisclosure } from "@hackert-ui/hooks";
import { cn } from "@hackert-ui/utils";
import { DateInput } from "@hackert-ui/dates";

assert.deepEqual(Object.keys(await import("@hackert-ui/core")).sort(), [
  "AppProvider",
  "DEFAULT_THEME",
  "byScheme",
  "isThemeColor",
  "schemeColors",
  "useAppTheme",
  "useSafeAppTheme",
  "useVariantColors",
]);

function Probe() {
  const theme = useAppTheme();
  const [opened] = useDisclosure(true);
  assert.equal(opened, true);
  assert.equal(useDebouncedValue("x"), "x");
  return h(Card, null, h(Button, null, theme.colors.primary));
}

const markup = renderToStaticMarkup(h(AppProvider, null, h(Probe)));
assert.match(markup, /^<style data-precedence="default" data-href="hui-button">@layer theme, base, components, utilities;/, markup);
assert.match(markup, /<button type="button"[^>]* class="hui-button" style="/, markup);
assert.ok(
  markup.includes(\`--hui-bg:light-dark(\${DEFAULT_THEME.colors.primary}, \${DEFAULT_THEME.dark.colors.primary})\`),
  markup,
);
assert.ok(markup.includes("--hui-fg:light-dark(#ffffff, #0a0a0a)"), markup);

assert.equal(cn("px-2", "px-4"), "px-4");
assert.equal(renderToStaticMarkup(h(DateInput)), "<div>DateInput</div>");

function FormFieldProbe() {
  const form = useAppForm({ defaultValues: { email: "", password: "" } });
  return h(
    form.AppForm,
    null,
    h(form.AppField, { name: "email" }, () =>
      h(FormField, null, h(FormField.Label, null, "Email")),
    ),
    h(form.AppField, { name: "password" }, (field) => h(field.TextInput, { type: "password" })),
    h(form.SubmitButton, null, "Save"),
  );
}
const formMarkup = renderToStaticMarkup(h(AppProvider, null, h(FormFieldProbe)));
assert.match(formMarkup, /<label [^>]*for="[^"]+-control"/, formMarkup);
// Server rendering merges same-precedence styles into one tag: data-href="hui-form hui-button".
assert.match(formMarkup, /data-href="[^"]*\\bhui-form\\b/, formMarkup);
assert.match(formMarkup, /aria-label="Show password"/, formMarkup);
assert.match(formMarkup, /<button type="submit"[^>]* class="hui-button"/, formMarkup);

// Components that touch document or the dialog API must still render on the server.
const uiMarkup = renderToStaticMarkup(
  h(
    AppProvider,
    null,
    h(Loader, { type: "dots" }),
    h(Modal, { opened: true, onClose() {}, title: "Hi" }, "Body"),
    h(Notifications),
  ),
);
assert.match(uiMarkup, /<span role="status" aria-label="Loading" data-type="dots"/, uiMarkup);
assert.match(uiMarkup, /<dialog [^>]*class="hui-modal"/, uiMarkup);
assert.ok(!uiMarkup.includes("hui-notifications"), uiMarkup);
console.log("smoke ok for react@${version}");
`,
    );

    run("pnpm", ["install", "--ignore-workspace", "--no-lockfile"], fixtureDirectory);

    // A bundled copy of core means a second ThemeContext inside ui.
    const uiBundle = await readFile(
      join(fixtureDirectory, "node_modules/@hackert-ui/ui/dist/index.js"),
      "utf8",
    );
    assert.match(uiBundle, /from "@hackert-ui\/core"/, "ui must import core, not bundle it");
    // ui has contexts of its own (Modal), so look for core's registry key rather than createContext.
    assert.doesNotMatch(
      uiBundle,
      /@hackert-ui\/core\/ThemeContext/,
      "ui must not bundle core's ThemeContext",
    );

    run("node", ["smoke.mjs"], fixtureDirectory);
  }
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}
