import { defineConfig, mergeConfig } from "vite-plus";
import shared from "../../vitest.shared.ts";

export default mergeConfig(shared, defineConfig({ test: { setupFiles: ["./vitest.setup.ts"] } }));
