import { defineConfig } from "tsdown";

export default defineConfig({
  workspace: {
    include: ["packages/*"],
  },
  entry: {
    index: "src/index.ts",
  },
  outDir: "dist",
  format: "esm",
  platform: "neutral",
  target: "es2022",
  dts: true,
  clean: true,
  sourcemap: true,
  outExtensions: () => ({ js: ".js", dts: ".d.ts" }),
  deps: {
    neverBundle: [/^react(?:\/.*)?$/, /^react-dom(?:\/.*)?$/],
  },
});
