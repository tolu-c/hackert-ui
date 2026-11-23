import { describe, expect, it } from "vite-plus/test";

import { SECTION_LIST } from "./catalog";

// Every package is globbed, so a new package or export is checked without edits here.
const PACKAGE_NAMES = import.meta.glob<string>("../../../packages/*/package.json", {
  eager: true,
  import: "name",
});
const PACKAGE_ENTRIES = import.meta.glob<Record<string, unknown>>(
  "../../../packages/*/src/index.ts",
  { eager: true },
);

// Theme pages document core by token rather than by export; utils is internal plumbing.
const DOCUMENTED_BY_TOPIC = new Set(["@hackert-ui/core", "@hackert-ui/utils"]);

// Exports still in progress. Delete an entry once `pnpm scaffold` (or a hand-written page) covers it.
const NO_PAGE_YET = new Set(["DateInput (@hackert-ui/dates)"]);

function documentedExports() {
  return Object.entries(PACKAGE_ENTRIES).flatMap(([entryPath, entry]) => {
    const packageName = PACKAGE_NAMES[entryPath.replace("src/index.ts", "package.json")];
    if (!packageName) {
      throw new Error(`catalog-coverage: no package.json next to ${entryPath}`);
    }
    if (DOCUMENTED_BY_TOPIC.has(packageName)) {
      return [];
    }
    return Object.keys(entry).map((exportName) => ({
      key: `${exportName} (${packageName})`,
      hasPage: hasPage(packageName, exportName),
    }));
  });
}

function hasPage(packageName: string, exportName: string) {
  const section = SECTION_LIST.find((candidate) => candidate.packageName === packageName);
  return (
    section?.items.some((item) => item.label === exportName || item.covers?.includes(exportName)) ??
    false
  );
}

describe("catalog coverage", () => {
  it("finds every workspace package", () => {
    expect(Object.keys(PACKAGE_ENTRIES)).toHaveLength(Object.keys(PACKAGE_NAMES).length);
  });

  it("has a playground page for every component and hook a package exports", () => {
    const missing = documentedExports()
      .filter((entry) => !entry.hasPage && !NO_PAGE_YET.has(entry.key))
      .map((entry) => entry.key);

    expect(missing).toEqual([]);
  });

  it("keeps NO_PAGE_YET limited to exports that still lack a page", () => {
    const waiting = new Set(
      documentedExports()
        .filter((entry) => !entry.hasPage)
        .map((entry) => entry.key),
    );
    const stale = [...NO_PAGE_YET].filter((key) => !waiting.has(key));

    expect(stale).toEqual([]);
  });

  it("only lists real exports in an item's covers", () => {
    const exported = new Set(documentedExports().map((entry) => entry.key));
    const unknown = SECTION_LIST.flatMap((section) =>
      section.items.flatMap((item) =>
        (("covers" in item ? item.covers : undefined) ?? [])
          .map((name) => `${name} (${section.packageName})`)
          .filter((key) => !exported.has(key)),
      ),
    );

    expect(unknown).toEqual([]);
  });
});
