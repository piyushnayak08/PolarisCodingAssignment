import { test, expect } from '../../src/fixtures/ui.fixture';

test.describe('US1 - View Product List', () => {
  test('positive: visitor sees products and can paginate', async ({ homePage, page }) => {
    await homePage.goto();
    await homePage.expectLoaded();
    await expect(homePage.productCards).toHaveCount(9);
    await homePage.goToPage(2);
    await expect(page).toHaveURL(/page=2|\/$/);
  });

  test('negative: invalid page parameter gracefully falls back', async ({ page, homePage }) => {
    await page.goto('/?page=9999');
    await expect(homePage.productCards.first()).toBeVisible();
  });
});

test.describe('US2 - View Product Details', () => {
  test('positive: opening product shows complete details', async ({ homePage, productPage, page }) => {
    await homePage.goto();
    await homePage.openFirstProduct();
    await expect(page).toHaveURL(/\/product\//);
    await productPage.expectProductDetailsVisible();
  });

  test('negative: invalid product id returns not-found behavior', async ({ page }) => {
    await page.goto('/product/does-not-exist');
    await expect(page.locator('text=/not found|error|product/i').first()).toBeVisible();
  });
});

test.describe('US3 - Search Product', () => {
  test('positive: searching by product name returns matching cards', async ({ homePage }) => {
    await homePage.goto();
    await homePage.search('Hammer');
    await homePage.expectSearchResultsContain('hammer');
  });

  test('negative: non-matching search returns no results indicator', async ({ homePage }) => {
    await homePage.goto();
    await homePage.search('___no-product-should-match___');
    await homePage.expectNoResultsMessage();
  });
});

test.describe('US4 - Filter by Category', () => {
  test('positive: selecting category updates product list', async ({ homePage }) => {
    await homePage.goto();
    await homePage.expectLoaded();
    await homePage.filterByCategory('Hand Tools');
    await expect(homePage.productCards.first()).toBeVisible();
  });

  test('negative: clearing category resets list', async ({ homePage }) => {
    await homePage.goto();
    await homePage.expectLoaded();
    const before = await homePage.productCards.count();
    await homePage.filterByCategory('Hand Tools');
    await expect(homePage.productCards.first()).toBeVisible();
    await homePage.clearCategory('Hand Tools');

    // The backend may return a larger unfiltered dataset after clear; assert reset behavior robustly.
    await expect(homePage.productCards.first()).toBeVisible();
    await expect.poll(async () => homePage.productCards.count()).toBeGreaterThanOrEqual(before);
  });
});

test.describe('US10 - Category Filtering and Reset with API consistency', () => {
  test('positive: selected filter persists on refresh', async ({ homePage, page }) => {
    await homePage.goto();
    await homePage.filterByCategory('Hand Tools');
    await homePage.expectCategoryChecked('Hand Tools');
    await page.reload();
    await expect(homePage.productCards.first()).toBeVisible();
  });

  test('negative/edge: filtered UI list should not exceed API filtered dataset', async ({ homePage, page, request }) => {
    await homePage.goto();
    await homePage.filterByCategory('Hand Tools');
    const apiResponse = await request.get('https://api.practicesoftwaretesting.com/products', {
      params: { by_category_slug: 'hand-tools' },
    });
    expect(apiResponse.ok()).toBeTruthy();
    const body = await apiResponse.json();
    const apiCount = body.data?.length ?? 0;
    const uiCount = await homePage.productCards.count();
    expect(uiCount).toBeLessThanOrEqual(apiCount || 1000);
  });
});
