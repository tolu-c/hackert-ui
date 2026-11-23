import { describe, expect, it } from "vite-plus/test";

import { installCommand, resolvePackages } from "./install";

describe("resolvePackages", () => {
  it("adds the peers a package needs", () => {
    expect(resolvePackages(["ui"])).toEqual(["core", "ui", "utils"]);
  });

  it("lists each package once, in catalog order", () => {
    expect(resolvePackages(["hooks", "ui", "core"])).toEqual(["core", "ui", "hooks", "utils"]);
  });
});

describe("installCommand", () => {
  it("uses each manager's add verb", () => {
    expect(installCommand("pnpm", ["hooks"])).toBe("pnpm add @hackert-ui/hooks");
    expect(installCommand("npm", ["hooks"])).toBe("npm install @hackert-ui/hooks");
    expect(installCommand("yarn", ["hooks"])).toBe("yarn add @hackert-ui/hooks");
  });

  it("includes required peers", () => {
    expect(installCommand("pnpm", ["form", "ui"])).toBe(
      "pnpm add @hackert-ui/core @hackert-ui/ui @hackert-ui/form @hackert-ui/utils @tanstack/react-form",
    );
  });

  it("includes peers from outside the scope", () => {
    expect(installCommand("yarn", ["form"])).toContain("@tanstack/react-form");
    expect(installCommand("yarn", ["ui"])).not.toContain("@tanstack");
  });
});
