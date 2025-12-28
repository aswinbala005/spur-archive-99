import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Test files location
    include: ["src/**/*.test.ts", "tests/**/*.test.ts"],

    // Environment for tests
    environment: "node",

    // Global timeout for tests
    testTimeout: 10000,

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/scripts/**"],
    },
  },
});
