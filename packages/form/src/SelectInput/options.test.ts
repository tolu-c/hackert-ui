import { describe, expect, it } from "vite-plus/test";

import { filterOptions, normalizeOptions } from "./options";

describe("normalizeOptions", () => {
  it("turns primitives into options labelled by their value", () => {
    expect(normalizeOptions(["React", 100, true])).toEqual([
      { value: "React", label: "React", disabled: false },
      { value: 100, label: "100", disabled: false },
      { value: true, label: "true", disabled: false },
    ]);
  });

  it("keeps object labels and disabled flags", () => {
    expect(
      normalizeOptions([{ value: "ng", label: "Angular", disabled: true }, { value: "vue" }]),
    ).toEqual([
      { value: "ng", label: "Angular", disabled: true },
      { value: "vue", label: "vue", disabled: false },
    ]);
  });

  it("flattens groups of primitives and objects, tagging each option with its group", () => {
    expect(
      normalizeOptions([
        { group: "Frontend", items: ["React"] },
        { group: "Backend", items: [{ value: "django", label: "Django" }] },
      ]),
    ).toEqual([
      { value: "React", label: "React", disabled: false, group: "Frontend" },
      { value: "django", label: "Django", disabled: false, group: "Backend" },
    ]);
  });

  it("mixes loose options and groups", () => {
    expect(normalizeOptions(["Any", { group: "Pinned", items: ["React"] }])).toEqual([
      { value: "Any", label: "Any", disabled: false },
      { value: "React", label: "React", disabled: false, group: "Pinned" },
    ]);
  });
});

describe("filterOptions", () => {
  const options = normalizeOptions(["Curaçao", "Canada", 100]);

  it("matches anywhere in the label, ignoring case and accents", () => {
    expect(filterOptions(options, "CURA").map((option) => option.label)).toEqual(["Curaçao"]);
  });

  it("ignores accents in the query too", () => {
    expect(filterOptions(options, "curaçao").map((option) => option.label)).toEqual(["Curaçao"]);
  });

  it("returns nothing when nothing matches", () => {
    expect(filterOptions(options, "zzz")).toEqual([]);
  });

  it("returns every option for an empty query", () => {
    expect(filterOptions(options, "  ")).toHaveLength(3);
  });

  it("matches labels of non-string values", () => {
    expect(filterOptions(options, "10").map((option) => option.value)).toEqual([100]);
  });
});
