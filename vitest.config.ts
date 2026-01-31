/// <reference types="vitest" />
import { defineConfig } from "vite";

import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    alias: {
      "@asyncflowstate/core": path.resolve(__dirname, "./packages/core/src"),
    },
  },
});
