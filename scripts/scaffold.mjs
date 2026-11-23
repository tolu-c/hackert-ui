// Creates a component or hook in a package plus its playground page and catalog entry.
// Usage: pnpm scaffold <package> <Name> "<description>"
//   pnpm scaffold ui CopyButton "Copies text to the clipboard."
//   pnpm scaffold hooks useCopy "Copies text and reports when it succeeded."
// Existing files are kept, so it also adds a page for a component that already exists.
import { execFileSync } from "node:child_process";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const CATALOG = "apps/playground/src/catalog.ts";

function kebabCase(name) {
  return name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

function isHook(name) {
  return /^use[A-Z][A-Za-z0-9]*$/.test(name);
}

function isComponent(name) {
  return /^[A-Z][A-Za-z0-9]*$/.test(name);
}

function pascalCase(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function componentFiles(name) {
  return {
    [`${name}.tsx`]: `import type { ComponentPropsWithoutRef, ReactNode } from "react";

export interface ${name}Props extends ComponentPropsWithoutRef<"div"> {
  readonly children?: ReactNode;
}

export function ${name}({ children, ...divProps }: ${name}Props) {
  return <div {...divProps}>{children}</div>;
}
`,
    "index.ts": `export { ${name}, type ${name}Props } from "./${name}";
`,
    [`${name}.test.tsx`]: `// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vite-plus/test";

import { ${name} } from "./${name}";

afterEach(cleanup);

describe("${name}", () => {
  it("renders its children", () => {
    render(<${name}>Hello</${name}>);

    expect(screen.getByText("Hello")).toBeTruthy();
  });
});
`,
  };
}

function hookFiles(name) {
  return {
    [`${name}.ts`]: `export function ${name}<T>(value: T): T {
  return value;
}
`,
    "index.ts": `export { ${name} } from "./${name}";
`,
    [`${name}.test.ts`]: `import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";

import { ${name} } from "./${name}";

describe("${name}", () => {
  it("returns the value it is given", () => {
    const { result } = renderHook(() => ${name}("hello"));

    expect(result.current).toBe("hello");
  });
});
`,
  };
}

function componentPage({ name, packageName, routePath }) {
  return `import { ${name} } from "${packageName}";
import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/catalog";
import { PageHeader } from "@/components/PageHeader";
import { UsageHeading } from "@/components/UsageHeading";
import { Configurator } from "@/configurator/Configurator";
import { defineControls } from "@/configurator/controls";
import { pickControls, searchOptionsFor } from "@/configurator/search";
import { toJsx, toSnippet } from "@/configurator/to-jsx";

const CONTROLS = defineControls([
  { kind: "text", prop: "content", label: "Content", defaultValue: "${name}" },
]);

const COMPONENT_DEFAULTS = {};
const IMPORT = 'import { ${name} } from "${packageName}";';

export const Route = createFileRoute("${routePath}")({
  head: () => pageHead("${routePath}"),
  ...searchOptionsFor(CONTROLS),
  component: ${name}Page,
});

function ${name}Page() {
  const values = Route.useSearch({ select: (search) => pickControls(CONTROLS, search) });
  const navigate = Route.useNavigate();
  const { content, ...props } = values;

  return (
    <div>
      <PageHeader to="${routePath}" importLine={IMPORT} />

      <UsageHeading />
      <Configurator
        controls={CONTROLS}
        values={values}
        onChange={(patch) =>
          navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true, resetScroll: false })
        }
        code={toSnippet(IMPORT, toJsx("${name}", props, COMPONENT_DEFAULTS, content))}
      >
        <${name} {...props}>{content}</${name}>
      </Configurator>
    </div>
  );
}
`;
}

function hookPage({ name, packageName, routePath }) {
  const pageName = `${pascalCase(name)}Page`;
  const demoName = `${pascalCase(name)}Demo`;
  return `import { ${name} } from "${packageName}";
import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/catalog";
import { Demo } from "@/components/Demo";
import { PageHeader } from "@/components/PageHeader";

const IMPORT = 'import { ${name} } from "${packageName}";';

export const Route = createFileRoute("${routePath}")({
  head: () => pageHead("${routePath}"),
  component: ${pageName},
});

function ${pageName}() {
  return (
    <div>
      <PageHeader to="${routePath}" importLine={IMPORT} />

      <Demo
        title="Basic usage"
        description="What ${name} returns for a fixed input."
        source={\`\${IMPORT}\\n\\nconst value = ${name}("hello");\`}
      >
        <${demoName} />
      </Demo>
    </div>
  );
}

function ${demoName}() {
  const value = ${name}("hello");

  return <p className="text-sm text-fg-soft">{value}</p>;
}
`;
}

// Locates the SECTIONS entry for a package by its packageName line.
function findSection(catalog, packageName) {
  const packageLine = catalog.indexOf(`packageName: "${packageName}",`);
  if (packageLine === -1) {
    return null;
  }
  const start = catalog.lastIndexOf("\n  ", catalog.lastIndexOf(": {", packageLine));
  const route = /to: "([^"]+)"/.exec(catalog.slice(start, packageLine));
  const itemsEnd = catalog.indexOf("\n    ],", packageLine);
  if (!route || itemsEnd === -1) {
    throw new Error(`scaffold: could not read the ${packageName} section of ${CATALOG}`);
  }
  return { route: route[1], itemsEnd };
}

function catalogItem({ routePath, name, description }) {
  return [
    "\n      {",
    `\n        to: "${routePath}",`,
    `\n        label: "${name}",`,
    `\n        description: ${JSON.stringify(description)},`,
    "\n      },",
  ].join("");
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export async function scaffold({ root, packageId, name, description }) {
  if (!isHook(name) && !isComponent(name)) {
    throw new Error(`scaffold: "${name}" must be PascalCase (CopyButton) or a hook name (useCopy)`);
  }
  if (!description?.trim()) {
    throw new Error("scaffold: a description is required; it becomes the page's lead paragraph");
  }

  const sourceDir = join(root, "packages", packageId, "src");
  if (!(await exists(sourceDir))) {
    throw new Error(`scaffold: packages/${packageId}/src does not exist`);
  }

  const packageName = `@hackert-ui/${packageId}`;
  const catalogPath = join(root, CATALOG);
  const catalog = await readFile(catalogPath, "utf8");
  const section = findSection(catalog, packageName);
  if (!section) {
    throw new Error(
      `scaffold: no section for ${packageName} in ${CATALOG}. Add one to SECTIONS (and the package to install.ts) first.`,
    );
  }

  const routePath = `${section.route}/${kebabCase(name)}`;
  const page = { name, packageName, routePath };
  const files = Object.entries(isHook(name) ? hookFiles(name) : componentFiles(name)).map(
    ([file, content]) => [`packages/${packageId}/src/${name}/${file}`, content],
  );
  files.push([
    `apps/playground/src/routes${routePath}.tsx`,
    isHook(name) ? hookPage(page) : componentPage(page),
  ]);

  const created = [];
  const updated = [];
  const kept = [];
  for (const [file, content] of files) {
    const path = join(root, file);
    if (await exists(path)) {
      kept.push(file);
      continue;
    }
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, content);
    created.push(file);
  }

  const indexFile = `packages/${packageId}/src/index.ts`;
  const indexPath = join(root, indexFile);
  const exportLine = `export * from "./${name}";`;
  const index = (await exists(indexPath)) ? await readFile(indexPath, "utf8") : "";
  if (!index.split("\n").includes(exportLine)) {
    await writeFile(
      indexPath,
      `${index}${index && !index.endsWith("\n") ? "\n" : ""}${exportLine}\n`,
    );
    (index ? updated : created).push(indexFile);
  }

  if (!catalog.includes(`to: "${routePath}",`)) {
    const item = catalogItem({ routePath, name, description });
    await writeFile(
      catalogPath,
      catalog.slice(0, section.itemsEnd) + item + catalog.slice(section.itemsEnd),
    );
    updated.push(CATALOG);
  }

  return { created, updated, kept, routePath };
}

async function main() {
  const [packageId, name, description] = process.argv.slice(2);
  if (!packageId || !name) {
    console.error('Usage: pnpm scaffold <package> <Name> "<description>"');
    process.exitCode = 1;
    return;
  }

  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const { created, updated, kept, routePath } = await scaffold({
    root,
    packageId,
    name,
    description,
  });
  const written = [...created, ...updated];

  // The catalog's route paths are typed against routeTree.gen.ts, so regenerate it now.
  execFileSync("pnpm", ["--filter", "playground", "generate-routes"], {
    cwd: root,
    stdio: "ignore",
  });
  if (written.length > 0) {
    execFileSync("vp", ["check", "--fix", ...written], { cwd: root, stdio: "inherit" });
  }

  for (const file of created) console.log(`  created  ${file}`);
  for (const file of updated) console.log(`  updated  ${file}`);
  for (const file of kept) console.log(`  kept     ${file}`);
  console.log(`\nPlayground page: ${routePath}`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
