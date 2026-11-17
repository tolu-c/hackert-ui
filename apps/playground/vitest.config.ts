import { defineConfig, mergeConfig } from "vite-plus";
import shared from "../../vitest.shared.ts";

// The playground's "@/" alias lives in tsconfig paths, which the shared config does not read.
export default mergeConfig(
  shared,
  defineConfig({ resolve: { tsconfigPaths: true }, test: { setupFiles: ["./vitest.setup.ts"] } }),
);
