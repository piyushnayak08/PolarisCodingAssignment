import { expect, type Page } from '@playwright/test';

export class AppHeaderPage {
  constructor(private readonly page: Page) {}

  async expectLoggedInUserVisible(fullName: string): Promise<void> {
    await expect(this.page.getByRole('button', { name: new RegExp(fullName, 'i') })).toBeVisible();
  }

  async expectHomeLinkHref(expected: string): Promise<void> {
    await expect(this.page.getByRole('link', { name: /^Home$/ })).toHaveAttribute('href', expected);
  }

  async expectMainTabsAndSpelling(): Promise<void> {
    const menuItems = this.page.getByRole('menubar', { name: /main menu/i }).getByRole('menuitem');
    await expect(menuItems).toHaveCount(4);
    await expect(this.page.getByRole('link', { name: /^Home$/ })).toBeVisible();
    await expect(this.page.getByRole('button', { name: /^Categories$/ })).toBeVisible();
    await expect(this.page.getByRole('link', { name: /^Contact$/ })).toBeVisible();
    await expect(this.page.getByRole('link', { name: /^Sign in$/ })).toBeVisible();
    await expect(this.page.getByRole('link', { name: /^Contakt$/ })).toHaveCount(0);
  }

  async expectLanguageSelectorVisible(): Promise<void> {
    await expect(this.page.getByRole('button', { name: /select language/i })).toBeVisible();
  }

  async goToContact(): Promise<void> {
    const contactLink = this.page.getByRole('link', { name: /^Contact$/ });
    await expect(contactLink).toHaveCount(1, { timeout: 5_000 });
    await contactLink.click();
  }

  async goToHome(): Promise<void> {
    const homeLink = this.page.getByRole('link', { name: /^Home$/ });
    await expect(homeLink).toHaveCount(1, { timeout: 5_000 });
    await homeLink.click();
  }

  async expectAtContactPage(): Promise<void> {
    await expect(this.page).toHaveURL(/contact/);
  }

  async expectAtHomePage(): Promise<void> {
    await expect(this.page).toHaveURL(/\/$|#\/$/);
  }

  async expectCategoriesDropdownDoesNotContainUndefined(): Promise<void> {
    await this.page.getByRole('button', { name: /^Categories$/ }).click();
    await expect(this.page.locator('text=/^undefined$/i')).toHaveCount(0);
  }
}
