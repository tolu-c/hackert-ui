import { describe, expect, it } from "vite-plus/test";

import { filterOptions } from "./filter-options";

const options = [
  { value: "fr", label: "France" },
  { value: "cu", label: "Curaçao" },
  { value: "ng", label: "Nigeria" },
  { value: "ca", label: "Canada" },
];

function labels(query: string) {
  return filterOptions(options, query).map((option) => option.label);
}

describe("filterOptions", () => {
  it("returns everything for an empty query", () => {
    expect(labels("")).toHaveLength(4);
    expect(labels("   ")).toHaveLength(4);
  });

  it("matches anywhere in the label, ignoring case", () => {
    expect(labels("AN")).toEqual(["France", "Canada"]);
  });

  it("ignores accents in both the query and the label", () => {
    expect(labels("curacao")).toEqual(["Curaçao"]);
    expect(labels("curaçao")).toEqual(["Curaçao"]);
  });

  it("returns nothing when nothing matches", () => {
    expect(labels("zzz")).toEqual([]);
  });
});
