import { describe, expect, it } from "vite-plus/test";

import { readPreference, resolveScheme } from "./color-scheme";

describe("resolveScheme", () => {
  it("follows the system setting for 'system'", () => {
    expect(resolveScheme("system", true)).toBe("dark");
    expect(resolveScheme("system", false)).toBe("light");
  });

  it("uses an explicit choice whatever the system says", () => {
    expect(resolveScheme("light", true)).toBe("light");
    expect(resolveScheme("dark", false)).toBe("dark");
  });
});

describe("readPreference", () => {
  it("falls back to 'system' for a missing or unknown stored value", () => {
    expect(readPreference(null)).toBe("system");
    expect(readPreference("sepia")).toBe("system");
  });

  it("reads a stored choice", () => {
    expect(readPreference("dark")).toBe("dark");
  });
});
