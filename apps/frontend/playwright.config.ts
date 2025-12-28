import type { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  // Look for test files in the "tests" directory inside apps/frontend
  testDir: "tests",

  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env.CI,

  // Retry on CI only to handle flaky network tests
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI to prevent resource exhaustion
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: "html",

  use: {
    // Base URL to use in actions like `await page.goto('/')`.
    baseURL: "http://localhost:5173",

    // Collect trace when retrying the failed test.
    trace: "on-first-retry",
  },

  // Configure projects for major browsers.
  projects: [
    {
      name: "chromium",
      use: {
        browserName: "chromium",
      },
    },
  ],

  // Run your local dev server before starting the tests.
  webServer: {
    // Uses 'vite build && vite preview' to test the production build
    command: "pnpm run build && pnpm run preview",
    port: 4173,
    reuseExistingServer: !process.env.CI,
  },
};

export default config;
