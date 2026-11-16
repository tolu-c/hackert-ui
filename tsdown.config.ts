import { defineConfig } from "vite-plus/pack";

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
    // tsdown <0.23 compatibility: resolve external dependency subpaths.
    // Remove to preserve subpath imports as written (the new default).
    // https://tsdown.dev/options/dependencies#deps-resolvedepsubpath
    resolveDepSubpath: true,
    neverBundle: [/^react(?:\/.*)?$/, /^react-dom(?:\/.*)?$/, /^@hackert-ui\//],
  },
});
