import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    root: "./",
    environment: "node",
    isolate: true,
    include: ["**/*.e2e-spec.ts"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/coverage/**"],
    pool: "forks",
    fileParallelism: false,
  },
  plugins: [
    swc.vite({
      module: { type: "es6" },
    }),
  ],
});
