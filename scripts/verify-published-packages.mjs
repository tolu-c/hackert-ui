// Packs every workspace package the way `pnpm publish` would, installs the
// tarballs into a throwaway project, and renders them through react-dom/server.
// This is what catches a broken `exports` map, a missing peer dependency, or a
// publishConfig rewrite that silently stopped working — none of which the
// in-repo tests can see, because they resolve TypeScript source directly.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packagesRoot = join(repositoryRoot, "packages");
const reactVersions = ["19.2.8"];

const packageDirectories = await readdir(packagesRoot);
const temporaryDirectory = await mkdtemp(join(tmpdir(), "hackert-ui-verify-"));

function run(command, args, cwd) {
  execFileSync(command, args, { cwd, stdio: "inherit" });
}

try {
  const tarballs = {};

  for (const directory of packageDirectories) {
    const packageDirectory = join(packagesRoot, directory);
    const manifest = JSON.parse(
      await readFile(join(packageDirectory, "package.json"), "utf8"),
    );

    assert.ok(
      !manifest.private,
      `${manifest.name} is marked private and cannot be published`,
    );
    assert.equal(
      manifest.publishConfig?.access,
      "public",
      `${manifest.name} must set publishConfig.access to "public"`,
    );

    const packDestination = join(temporaryDirectory, "tarballs");
    await mkdir(packDestination, { recursive: true });

    const before = new Set(await readdir(packDestination).catch(() => []));
    run(
      "pnpm",
      ["pack", "--pack-destination", packDestination],
      packageDirectory,
    );
    const created = (await readdir(packDestination)).find(
      (f) => !before.has(f),
    );
    assert.ok(created, `pnpm pack produced no tarball for ${manifest.name}`);

    tarballs[manifest.name] = join(packDestination, created);
    console.log(`packed ${manifest.name} -> ${created}`);
  }

  for (const version of reactVersions) {
    const fixtureDirectory = join(temporaryDirectory, `react-${version}`);
    await mkdir(fixtureDirectory, { recursive: true });

    const dependencies = { react: version, "react-dom": version };
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
import { Button, Card } from "@hackert-ui/ui";
import { Input } from "@hackert-ui/form";
import { useDebouncedValue, useDisclosure } from "@hackert-ui/hooks";
import { cn } from "@hackert-ui/utils";
import { DateInput } from "@hackert-ui/dates";

assert.deepEqual(Object.keys(await import("@hackert-ui/core")).sort(), [
  "AppProvider",
  "DEFAULT_THEME",
  "useAppTheme",
  "useSafeAppTheme",
]);

function Probe() {
  const theme = useAppTheme();
  const [opened] = useDisclosure(true);
  assert.equal(opened, true);
  assert.equal(useDebouncedValue("x"), "x");
  return h(Card, null, h(Button, null, theme.colors.primary));
}

const markup = renderToStaticMarkup(h(AppProvider, null, h(Probe)));
assert.match(markup, /^<div><button type="button" class="my-button cursor-pointer" style="/);
assert.ok(
  markup.includes(\`background-color:\${DEFAULT_THEME.colors.primary}\`),
  markup,
);

assert.equal(cn("px-2", "px-4"), "px-4");
assert.equal(renderToStaticMarkup(h(DateInput)), "<div>DateInput</div>");

assert.match(renderToStaticMarkup(h(Input, { label: "Email" })), /<label for=/);
console.log("smoke ok for react@${version}");
`,
    );

    run(
      "pnpm",
      ["install", "--ignore-workspace", "--no-lockfile"],
      fixtureDirectory,
    );
    run("node", ["smoke.mjs"], fixtureDirectory);
  }
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}
