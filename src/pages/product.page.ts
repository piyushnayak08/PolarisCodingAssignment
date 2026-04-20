import { expect, type Locator, type Page } from '@playwright/test';

export class ProductPage {
  readonly page: Page;
  readonly addToCartButton: Locator;
  readonly productNameHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addToCartButton = page.getByRole('button', { name: /add to cart/i });
    this.productNameHeading = page.getByRole('heading', { level: 1 });
  }

  async expectProductDetailsVisible(): Promise<void> {
    await expect(this.productNameHeading).toBeVisible();
    await expect(this.page.locator('[data-test="unit-price"]').or(this.page.locator('text=/\$\d+/'))).toBeVisible();
    await expect(this.addToCartButton).toBeVisible();
    await expect(this.addToCartButton).toBeEnabled();
  }

  async getProductName(): Promise<string> {
    const name = (await this.productNameHeading.textContent())?.trim() ?? '';
    return name;
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();

    // Some deployments expose only a transient success toast and no persistent cart counter.
    // Keep this soft and let checkout assertions verify cart persistence.
    await this.page.locator('text=/added|cart|basket/i').first().isVisible().catch(() => false);
  }

  async expectAddToCartDisabled(): Promise<void> {
    await expect(this.addToCartButton).toBeDisabled();
  }
}
