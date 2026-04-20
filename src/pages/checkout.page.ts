import { expect, type Page } from '@playwright/test';

export class CheckoutPage {
  constructor(private readonly page: Page) {}

  private proceedButton() {
    return this.page.locator('button:visible', { hasText: /proceed to checkout/i }).first();
  }

  private checkoutNavLink() {
    return this.page.locator('a[href="/checkout"], a[href="#/checkout"], a[aria-label="cart"]').first();
  }

  private cartStep() {
    return this.page.locator('li').filter({ hasText: /^\s*Cart\s*\d*\s*$/i }).first();
  }

  private cartRows() {
    return this.page.locator('tbody tr');
  }

  async hasAnyCartRows(): Promise<boolean> {
    return (await this.cartRows().count()) > 0;
  }

  async cartStepItemCount(): Promise<number> {
    const step = this.cartStep();
    if ((await step.count()) === 0) {
      return 0;
    }
    const text = ((await step.textContent()) ?? '').replace(/\s+/g, ' ').trim();
    const match = text.match(/(\d+)\s*$/);
    return match ? Number(match[1]) : 0;
  }

  async expectCartHasItemsIndicator(): Promise<void> {
    await expect
      .poll(async () => this.cartStepItemCount(), {
        timeout: 10_000,
        message: 'Cart regression: cart step did not show any items after add-to-cart.',
      })
      .toBeGreaterThan(0);
  }

  async goto(): Promise<void> {
    const nav = this.checkoutNavLink();
    if ((await nav.count()) > 0) {
      await nav.click().catch(async () => {
        await this.page.goto('/checkout');
      });
    } else {
      await this.page.goto('/checkout');
    }
    await expect(this.page).toHaveURL(/checkout|#\/checkout/);
  }

  async expectCheckoutLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/checkout/);
    await expect(this.page.locator('li').filter({ hasText: /^\s*Cart\s*\d*\s*$/i }).first()).toBeVisible();
    await expect(this.page.locator('li').filter({ hasText: /^\s*Sign in\s*\d*\s*$/i }).first()).toBeVisible();
    await expect(this.page.locator('li').filter({ hasText: /^\s*Billing Address\s*\d*\s*$/i }).first()).toBeVisible();
    await expect(this.page.locator('li').filter({ hasText: /^\s*Payment\s*\d*\s*$/i }).first()).toBeVisible();
  }

  async expectCartContainsProduct(productName: string): Promise<void> {
    await this.ensureCartRowsLoaded();
    const productRow = this.cartRows().filter({ hasText: productName }).first();
    await expect(
      productRow,
      `Cart regression: expected product "${productName}" in checkout summary after adding to cart.`
    ).toBeVisible({ timeout: 10_000 });
  }

  async increaseQuantity(): Promise<void> {
    await this.ensureCartRowsLoaded();
    const quantity = this.page.getByRole('spinbutton', { name: /quantity/i }).or(this.page.locator('input[type="number"]')).first();
    await expect(quantity).toBeVisible();
    const current = Number((await quantity.inputValue()) || '1');
    await quantity.fill(String(current + 1));
  }

  async expectQuantityValue(value: number): Promise<void> {
    await this.ensureCartRowsLoaded();
    const quantity = this.page.getByRole('spinbutton', { name: /quantity/i }).or(this.page.locator('input[type="number"]')).first();
    await expect(quantity).toHaveValue(String(value));
  }

  async removeFirstItem(): Promise<void> {
    await this.ensureCartRowsLoaded();
    const cartRow = this.cartRows().first();
    await expect(cartRow).toBeVisible();
    const deleteControl = cartRow.locator('td').last().locator('*').first();
    await expect(deleteControl).toBeVisible();
    await deleteControl.click();
  }

  async expectEmptyCartMessage(): Promise<void> {
    await expect(this.page.locator('text=/cart is empty|empty cart|no items/i').first()).toBeVisible();
  }

  async proceedFromCartStep(): Promise<void> {
    await this.expectCartHasItemsIndicator();
    await expect(this.proceedButton()).toBeVisible();
    await this.proceedButton().click();
  }

  async proceedFromSignInStep(): Promise<void> {
    await expect(this.proceedButton()).toBeVisible();
    await this.proceedButton().click();
  }

  async expectBillingAddressStepLoaded(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: /billing address/i })).toBeVisible();
  }

  async expectPaymentStepVisible(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: /^Payment$/i })).toBeVisible();
  }

  async expectProceedDisabledOnBilling(): Promise<void> {
    await expect(this.page.getByRole('button', { name: /proceed to checkout/i }).first()).toBeDisabled();
  }

  private async ensureCartRowsLoaded(): Promise<void> {
    if ((await this.cartRows().count()) > 0) {
      return;
    }

    const cartStep = this.cartStep();
    if ((await cartStep.count()) > 0) {
      await cartStep.click({ force: true }).catch(() => undefined);
      await this.page
        .evaluate(() => {
          const steps = Array.from(document.querySelectorAll('li'));
          const cart = steps.find((el) => /cart\s*\d*/i.test((el.textContent || '').trim()));
          (cart as HTMLElement | undefined)?.click();
        })
        .catch(() => undefined);
    }

    await expect
      .poll(async () => this.cartRows().count(), {
        timeout: 10_000,
        message: 'Cart regression: checkout summary has no product rows after retry.',
      })
      .toBeGreaterThan(0);
  }
}
