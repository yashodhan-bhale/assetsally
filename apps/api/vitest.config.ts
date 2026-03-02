import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    root: "./",
    environment: "node",
    isolate: false,
    exclude: ["**/node_modules/**", "**/dist/**", "**/coverage/**"],
    pool: "forks",
    fileParallelism: true,
    maxConcurrency: 4,
  },
  plugins: [
    // This is required to build the test files with SWC
    swc.vite({
      // Explicitly set the module type to avoid issues with NestJS
      module: { type: "es6" },
    }),
  ],
});
