import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";

import { scaffold } from "./scaffold.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CATALOG = "apps/playground/src/catalog.ts";

let root;

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "hackert-ui-scaffold-"));
  // The real catalog keeps the section parsing honest; fixed indexes keep the tests independent of work in progress.
  await mkdir(dirname(join(root, CATALOG)), { recursive: true });
  await cp(join(repositoryRoot, CATALOG), join(root, CATALOG));
  for (const [file, content] of [
    ["packages/ui/src/index.ts", 'export * from "./Button";\n'],
    ["packages/hooks/src/index.ts", 'export * from "./useDisclosure";\n'],
  ]) {
    await mkdir(dirname(join(root, file)), { recursive: true });
    await writeFile(join(root, file), content);
  }
  await mkdir(join(root, "packages/dates/src"), { recursive: true });
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

function read(file) {
  return readFile(join(root, file), "utf8");
}

describe("scaffold", () => {
  it("creates a component, its test, its export and its playground page", async () => {
    await scaffold({ root, packageId: "ui", name: "FixtureWidget", description: "A fixture." });

    expect(await read("packages/ui/src/FixtureWidget/FixtureWidget.tsx")).toContain(
      "export function FixtureWidget(",
    );
    expect(await read("packages/ui/src/FixtureWidget/FixtureWidget.test.tsx")).toContain(
      'describe("FixtureWidget"',
    );
    expect(await read("packages/ui/src/index.ts")).toContain('export * from "./FixtureWidget";');
    expect(await read("apps/playground/src/routes/ui/fixture-widget.tsx")).toContain(
      'createFileRoute("/ui/fixture-widget")',
    );
  });

  it("reports the index and catalog as updated rather than created", async () => {
    const result = await scaffold({
      root,
      packageId: "ui",
      name: "FixtureWidget",
      description: "A fixture.",
    });

    expect(result.updated).toEqual(["packages/ui/src/index.ts", CATALOG]);
    expect(result.created).not.toContain(CATALOG);
  });

  it("adds the page to its package's catalog section", async () => {
    await scaffold({ root, packageId: "ui", name: "FixtureWidget", description: "A fixture." });
    const catalog = await read(CATALOG);
    const uiSection = catalog.slice(catalog.indexOf("  ui: {"), catalog.indexOf("  form: {"));

    expect(uiSection).toContain(
      '{\n        to: "/ui/fixture-widget",\n        label: "FixtureWidget",\n        description: "A fixture.",\n      },',
    );
  });

  it("scaffolds a hook as a .ts module with a kebab-case page", async () => {
    await scaffold({
      root,
      packageId: "hooks",
      name: "useFixtureValue",
      description: "A fixture.",
    });

    expect(await read("packages/hooks/src/useFixtureValue/useFixtureValue.ts")).toContain(
      "export function useFixtureValue",
    );
    expect(await read("packages/hooks/src/useFixtureValue/useFixtureValue.test.ts")).toContain(
      "renderHook",
    );
    expect(await read("apps/playground/src/routes/hooks/use-fixture-value.tsx")).toContain(
      'createFileRoute("/hooks/use-fixture-value")',
    );
  });

  it("keeps files that already exist and reports them", async () => {
    const component = "packages/ui/src/FixtureWidget/FixtureWidget.tsx";
    await mkdir(dirname(join(root, component)), { recursive: true });
    await writeFile(join(root, component), "export function FixtureWidget() {}\n");

    const result = await scaffold({
      root,
      packageId: "ui",
      name: "FixtureWidget",
      description: "A fixture.",
    });

    expect(await read(component)).toBe("export function FixtureWidget() {}\n");
    expect(result.kept).toContain(component);
  });

  it("adds the export and catalog entry only once when run twice", async () => {
    const options = { root, packageId: "ui", name: "FixtureWidget", description: "A fixture." };
    await scaffold(options);
    await scaffold(options);

    expect((await read("packages/ui/src/index.ts")).split("./FixtureWidget").length - 1).toBe(1);
    expect((await read(CATALOG)).split('"/ui/fixture-widget"').length - 1).toBe(1);
  });

  it("refuses a package with no catalog section", async () => {
    await expect(
      scaffold({ root, packageId: "dates", name: "DatePicker", description: "Picks a date." }),
    ).rejects.toThrow(/no section for @hackert-ui\/dates in .*catalog\.ts/);
  });

  it("refuses a name that is neither PascalCase nor a use-hook", async () => {
    await expect(
      scaffold({ root, packageId: "ui", name: "fixture-widget", description: "A fixture." }),
    ).rejects.toThrow(/"fixture-widget"/);
  });

  it("refuses a package that does not exist", async () => {
    await expect(
      scaffold({ root, packageId: "charts", name: "BarChart", description: "Bars." }),
    ).rejects.toThrow(/packages\/charts/);
  });
});
