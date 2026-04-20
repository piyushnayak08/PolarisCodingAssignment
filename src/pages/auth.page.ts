import { expect, type Locator, type Page } from '@playwright/test';

export class AuthPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page
      .getByRole('textbox', { name: /email address|your e-mail|e-mail|email/i })
      .or(page.locator('input[type="email"]'))
      .first();
    this.passwordInput = page
      .getByRole('textbox', { name: /password|your password/i })
      .or(page.locator('input[type="password"]'))
      .first();
    // Keep this scoped to form submit controls to avoid clicking social sign-in buttons.
    this.loginButton = page.locator('form button[type="submit"], form input[type="submit"]').first();
  }

  async gotoLogin(): Promise<void> {
    await this.page.goto('/auth/login');

    // Try normal routing first. Buggy deployment uses hash-based routes as fallback.
    try {
      await expect(this.emailInput).toBeVisible({ timeout: 7_000 });
      return;
    } catch {
      await this.page.goto('/#/auth/login');
    }

    await expect(this.emailInput.or(this.loginButton).first()).toBeVisible({ timeout: 15_000 });
  }

  async login(email: string, password: string): Promise<void> {
    await this.gotoLogin();
    await expect(this.emailInput).toBeVisible({ timeout: 15_000 });
    await this.emailInput.fill(email);
    await expect(this.passwordInput).toBeVisible({ timeout: 10_000 });
    await this.passwordInput.fill(password);

    if (await this.loginButton.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await this.loginButton.click();
    } else if (await this.page.getByRole('button', { name: /^Login$/i }).isVisible({ timeout: 3_000 }).catch(() => false)) {
      await this.page.getByRole('button', { name: /^Login$/i }).click();
    } else {
      await this.passwordInput.press('Enter');
    }
  }

  async expectLoggedIn(fullName: string): Promise<void> {
    await expect(this.page.getByRole('button', { name: fullName })).toBeVisible();
  }

  async expectLoginError(): Promise<void> {
    await expect(this.page.locator('text=/invalid|incorrect|failed|unauthorized/i').first()).toBeVisible();
  }
}
