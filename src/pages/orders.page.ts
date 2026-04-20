import { expect, type Locator, type Page } from '@playwright/test';

export class OrdersPage {
  readonly page: Page;
  readonly invoicesButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.invoicesButton = page.getByRole('button', { name: /invoices|orders/i });
  }

  async openFromAccount(): Promise<void> {
    await this.page.goto('/account/invoices');
    await expect(this.page).toHaveURL(/account\/invoices|#\/account\/invoices/);
  }

  async expectOrderHistorySection(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: /invoice|order history|my invoices/i }).first()).toBeVisible();
  }

  async expectRedirectedToLoginOrAccount(): Promise<void> {
    await expect(this.page).toHaveURL(/auth\/login|account/);
  }
}
