/// <reference types="vitest" />
import { defineConfig } from "vitest/config";

import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    alias: {
      "@asyncflowstate/core": path.resolve(__dirname, "./packages/core/src"),
      "@asyncflowstate/react": path.resolve(__dirname, "./packages/react/src"),
      "@asyncflowstate/next": path.resolve(__dirname, "./packages/next/src"),
    },
  },
});
