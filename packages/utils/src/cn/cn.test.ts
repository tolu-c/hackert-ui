import { describe, expect, it } from "vite-plus/test";
import { cn } from "./cn";

describe("cn", () => {
  it("joins truthy class values and drops falsy ones", () => {
    expect(cn("a", false, undefined, { b: true, c: false }, ["d"])).toBe("a b d");
  });

  it("lets a later Tailwind utility override a conflicting earlier one", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });
});
