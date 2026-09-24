import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end suite for the web build.
 *
 * It drives the same screens a device would, through `expo start --web`, with a
 * mobile viewport so the layout under test matches the phone. The API is stubbed
 * per test (`tests/e2e/fake-api.ts`), so the suite needs no server, no OTP and no
 * database — which is what lets it run anywhere.
 */
// Deliberately not Expo's usual 8081: a dev server is often already listening
// there, and Expo answers a busy port with an interactive prompt that cannot be
// answered from a test run.
const PORT = 19006;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.spec.ts',
  // One worker: the flows share a single dev server and a single fake backend.
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  timeout: 90_000,
  expect: { timeout: 20_000 },
  use: {
    baseURL,
    trace: 'on-first-retry',
    ...devices['Pixel 7'],
  },
  webServer: {
    // `CI` keeps Expo from waiting on input and from opening a browser. It has to
    // be the string "true": Expo's env parser rejects a numeric "1".
    command: `npx expo start --web --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    env: { CI: 'true' },
  },
});
