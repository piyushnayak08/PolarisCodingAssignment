import { test as base, expect } from '@playwright/test';
import { accounts, defaultUiAccount } from '../data/accounts';
import type { Account } from '../types/models';
import { AppHeaderPage } from '../pages/app-header.page';
import { AuthPage } from '../pages/auth.page';
import { CheckoutPage } from '../pages/checkout.page';
import { HomePage } from '../pages/home.page';
import { OrdersPage } from '../pages/orders.page';
import { ProductPage } from '../pages/product.page';

type UiFixtures = {
  account: Account;
  appHeaderPage: AppHeaderPage;
  homePage: HomePage;
  authPage: AuthPage;
  productPage: ProductPage;
  checkoutPage: CheckoutPage;
  ordersPage: OrdersPage;
  loginAsDefaultUser: () => Promise<void>;
};

export const test = base.extend<UiFixtures>({
  account: async ({}, use) => {
    await use(defaultUiAccount);
  },

  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  authPage: async ({ page }, use) => {
    await use(new AuthPage(page));
  },

  appHeaderPage: async ({ page }, use) => {
    await use(new AppHeaderPage(page));
  },

  productPage: async ({ page }, use) => {
    await use(new ProductPage(page));
  },

  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },

  ordersPage: async ({ page }, use) => {
    await use(new OrdersPage(page));
  },

  loginAsDefaultUser: async ({ authPage, appHeaderPage, page }, use) => {
    await use(async () => {
      const loggedInUser = page.getByRole('button', { name: /jane doe/i });
      if ((await loggedInUser.count()) > 0 && (await loggedInUser.first().isVisible().catch(() => false))) {
        return;
      }

      await authPage.login(defaultUiAccount.email, defaultUiAccount.password);
      if (!/account/i.test(page.url())) {
        await authPage.login(defaultUiAccount.email, defaultUiAccount.password);
      }
      await expect(page).toHaveURL(/account/);
      await appHeaderPage.expectLoggedInUserVisible(`${accounts.jane.firstName} ${accounts.jane.lastName}`);
    });
  },
});

export { expect };
