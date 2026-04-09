/// <reference types="vitest" />
import { defineConfig } from "vitest/config";

import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [path.resolve(__dirname, "./vitest.setup.ts")],
    alias: {
      "@asyncflowstate/core": path.resolve(__dirname, "./packages/core/src"),
      "@asyncflowstate/react": path.resolve(__dirname, "./packages/react/src"),
      "@asyncflowstate/next": path.resolve(__dirname, "./packages/next/src"),
      "@asyncflowstate/vue": path.resolve(__dirname, "./packages/vue/src"),
      "@asyncflowstate/svelte": path.resolve(
        __dirname,
        "./packages/svelte/src",
      ),
      "@asyncflowstate/angular": path.resolve(
        __dirname,
        "./packages/angular/src",
      ),
      "@asyncflowstate/solid": path.resolve(__dirname, "./packages/solid/src"),
    },
  },
});
