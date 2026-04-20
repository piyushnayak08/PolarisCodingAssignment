import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const target = process.env.TEST_TARGET ?? 'main';
const baseUrl =
  target === 'buggy'
    ? process.env.BASE_URL_BUGGY ?? 'https://with-bugs.practicesoftwaretesting.com'
    : process.env.BASE_URL_MAIN ?? 'https://practicesoftwaretesting.com';
const apiBaseUrl = process.env.API_BASE_URL ?? 'https://api.practicesoftwaretesting.com';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 60_000,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['junit', { outputFile: 'test-results/junit/results.xml' }],
    ['json', { outputFile: 'test-results/json/results.json' }],
  ],
  use: {
    baseURL: baseUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'setup',
      testMatch: /tests[\\/]setup[\\/].*\.setup\.ts/,
    },
    {
      name: 'ui-chromium',
      testMatch: /tests[\\/]ui[\\/].*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'api',
      testMatch: /tests[\\/]api[\\/].*\.spec\.ts/,
      use: {
        baseURL: apiBaseUrl,
      },
    },
  ],
});
