import { test as base, expect } from '@playwright/test';
import { accounts } from '../data/accounts';
import { env } from '../config/env';
import { ShopApiClient } from '../utils/api-client';

type ApiFixtures = {
  apiClient: ShopApiClient;
  authToken: string;
};

export const test = base.extend<ApiFixtures>({
  apiClient: async ({ request }, use) => {
    await use(new ShopApiClient(request));
  },

  authToken: [
    async ({ playwright }, use) => {
      const context = await playwright.request.newContext({
        baseURL: env.apiBaseUrl,
      });

      const client = new ShopApiClient(context);
      const loginResponse = await client.login(accounts.jane);
      expect(loginResponse.ok()).toBeTruthy();
      const token = await client.extractTokenFromLogin(loginResponse);
      expect(token).toBeTruthy();

      await use(token as string);
      await context.dispose();
    },
    { scope: 'worker' },
  ],
});

export const defaultApiAccount = accounts.jane;

export { expect };
