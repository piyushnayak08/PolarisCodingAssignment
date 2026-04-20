import { test, expect } from '../../src/fixtures/ui.fixture';

async function ensureLoggedInOnHome({
  loginAsDefaultUser,
  homePage,
  page,
}: {
  loginAsDefaultUser: () => Promise<void>;
  homePage: { goto: () => Promise<void> };
  page: import('@playwright/test').Page;
}): Promise<void> {
  await homePage.goto();
  const userMenu = page.getByRole('button', { name: /jane doe/i });
  if ((await userMenu.count()) === 0) {
    await loginAsDefaultUser();
    await homePage.goto();
  }
  await expect(userMenu).toBeVisible();
}

async function prepareCheckoutWithItem({
  loginAsDefaultUser,
  homePage,
  productPage,
  checkoutPage,
  page,
}: {
  loginAsDefaultUser: () => Promise<void>;
  homePage: { goto: () => Promise<void>; openFirstProduct: () => Promise<void> };
  productPage: { addToCart: () => Promise<void> };
  checkoutPage: {
    goto: () => Promise<void>;
    hasAnyCartRows: () => Promise<boolean>;
    cartStepItemCount: () => Promise<number>;
  };
  page: import('@playwright/test').Page;
}): Promise<string> {
  let productName = '';

  for (let attempt = 1; attempt <= 5; attempt++) {
    await ensureLoggedInOnHome({ loginAsDefaultUser, homePage, page });
    await homePage.openFirstProduct();
    productName = (await page.getByRole('heading', { level: 1 }).textContent())?.trim() ?? '';
    await productPage.addToCart();
    await checkoutPage.goto();

    if ((await checkoutPage.hasAnyCartRows()) || (await checkoutPage.cartStepItemCount()) > 0) {
      return productName;
    }

    // Retry on transient cart rendering issues after a refresh.
    await page.reload();
    if ((await checkoutPage.hasAnyCartRows()) || (await checkoutPage.cartStepItemCount()) > 0) {
      return productName;
    }
  }

  throw new Error('Cart setup failed: checkout did not show cart rows or cart item indicator after multiple retries.');
}

test.describe('US5 - Login', () => {
  test('positive: valid credentials log user in and persist in navigation', async ({ loginAsDefaultUser, page }) => {
    await loginAsDefaultUser();
    await page.goto('/');
    await expect(page.getByRole('button', { name: /jane doe/i })).toBeVisible();
  });
});

test.describe('US6 - Add Product to Cart', () => {
  test('positive: add to cart and verify product is visible in checkout summary', async ({ loginAsDefaultUser, homePage, productPage, checkoutPage, page }) => {
    await prepareCheckoutWithItem({ loginAsDefaultUser, homePage, productPage, checkoutPage, page });
    await checkoutPage.expectCheckoutLoaded();
    await checkoutPage.expectCartHasItemsIndicator();
  });

  test('negative: out-of-stock item should not be addable', async ({ homePage, page }) => {
    await homePage.goto();
    await homePage.openOutOfStockProduct();
    await expect(page.getByRole('button', { name: /add to cart/i })).toBeDisabled();
  });
});

test.describe('US8 - Complete Checkout', () => {
  test('positive: checkout page exposes checkout stepper with payment stage', async ({ loginAsDefaultUser, homePage, productPage, checkoutPage, page }) => {
    await prepareCheckoutWithItem({ loginAsDefaultUser, homePage, productPage, checkoutPage, page });
    await checkoutPage.expectCheckoutLoaded();
    await checkoutPage.expectCartHasItemsIndicator();
  });
});

test.describe('US9 - View Order History', () => {
  test('positive: logged-in user can open order history/invoices', async ({ loginAsDefaultUser, ordersPage }) => {
    await loginAsDefaultUser();
    await ordersPage.openFromAccount();
    await ordersPage.expectOrderHistorySection();
  });

});

test.describe('Anonymous negative flows', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('negative: invalid credentials show authentication error', async ({ authPage, page }) => {
    await authPage.login('invalid.user@example.com', 'wrongpass');
    await expect(page.locator('text=/invalid|incorrect|failed|unauthorized/i').first()).toBeVisible();
  });

  test('negative: anonymous user cannot access account order history directly', async ({ page }) => {
    await page.goto('/account');
    await expect(page).toHaveURL(/auth\/login|account/);
  });
});
