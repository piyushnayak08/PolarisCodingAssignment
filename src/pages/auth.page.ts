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

  private async hasLoginForm(timeoutMs: number): Promise<boolean> {
    const emailVisible = await this.emailInput.isVisible({ timeout: timeoutMs }).catch(() => false);
    if (emailVisible) {
      return true;
    }

    const passwordVisible = await this.passwordInput.isVisible({ timeout: timeoutMs }).catch(() => false);
    return passwordVisible;
  }

  async gotoLogin(): Promise<void> {
    const routeAttempts = ['/auth/login', '/#/auth/login'];

    for (const route of routeAttempts) {
      await this.page.goto(route, { waitUntil: 'domcontentloaded' });
      if (await this.hasLoginForm(8_000)) {
        return;
      }
    }

    // CI can occasionally redirect initial auth routes; fall back to home and open Sign in from header.
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
    const signInLink = this.page.getByRole('link', { name: /^sign in$/i }).first();
    if (await signInLink.isVisible({ timeout: 10_000 }).catch(() => false)) {
      await signInLink.click();
      if (await this.hasLoginForm(10_000)) {
        return;
      }
    }

    const currentUrl = this.page.url();
    const title = await this.page.title().catch(() => 'n/a');
    throw new Error(`Unable to locate login form after route and header fallbacks. URL: ${currentUrl}; title: ${title}`);
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
