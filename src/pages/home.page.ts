import { expect, type Locator, type Page } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly productCards: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page
      .locator('input[placeholder*="Search" i], [data-test="search-query"], input[type="search"]')
      .or(page.getByRole('textbox').first())
      .first();
    this.searchButton = page.getByRole('button', { name: /search|serch/i }).first();
    this.productCards = page.locator('a.card[href*="/product/"], a.card[href*="#/product/"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/|#\/$/);
    await expect(this.productCards.first()).toBeVisible();
  }

  async openFirstProduct(): Promise<void> {
    await expect(this.productCards.first()).toBeVisible();
    await this.productCards.first().click();
  }

  async openOutOfStockProduct(): Promise<void> {
    const outOfStockCard = this.productCards.filter({ hasText: 'Out of stock' }).first();
    await expect(outOfStockCard).toBeVisible();
    await outOfStockCard.click();
  }

  async search(text: string): Promise<void> {
    await expect(this.searchInput).toBeVisible({ timeout: 15_000 });
    await this.searchInput.fill(text);
    await expect(this.searchButton).toBeVisible({ timeout: 10_000 });
    await this.searchButton.click();
  }

  async filterByCategory(categoryName: string): Promise<void> {
    await this.page.getByRole('checkbox', { name: categoryName }).check();
  }

  async clearCategory(categoryName: string): Promise<void> {
    await this.page.getByRole('checkbox', { name: categoryName }).uncheck();
  }

  async goToPage(pageNumber: number): Promise<void> {
    await this.page.getByRole('button', { name: `Page-${pageNumber}` }).click();
  }

  async expectSearchResultsContain(text: string): Promise<void> {
    await expect(this.productCards.first()).toContainText(new RegExp(text, 'i'));
  }

  async expectNoResultsMessage(): Promise<void> {
    await expect(this.page.locator('text=/no results|there are no products/i').first()).toBeVisible();
  }

  async expectCategoryChecked(categoryName: string): Promise<void> {
    await expect(this.page.getByRole('checkbox', { name: categoryName })).toBeChecked();
  }

  async expectSortLabelCorrect(): Promise<void> {
    const text = ((await this.page.getByRole('heading', { level: 4 }).first().textContent()) ?? '').toLowerCase();
    expect(text).toContain('sort');
    expect(text).not.toContain('sorth');
  }

  async expectBrandFilterVisibleWithRealData(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: /by brand/i })).toBeVisible();
    await expect(this.page.getByRole('checkbox', { name: /forgeflex tools/i })).toBeVisible();
  }

  async expectCategoriesDoNotContainUndefined(): Promise<void> {
    await expect(this.page.locator('text=/^undefined$/i')).toHaveCount(0);
  }
}
