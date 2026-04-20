import { test, expect } from '../../src/fixtures/ui.fixture';
import { accounts } from '../../src/data/accounts';
import { env } from '../../src/config/env';

test.describe('Bug Hunt - Functional navigation and behavior checks', () => {
  test('home and contact links redirect correctly', async ({ homePage, appHeaderPage, page }) => {
    await homePage.goto();

    const contactLink = page.getByRole('link', { name: /^Contact$/ });
    await expect(
      contactLink,
      'Header regression: expected a Contact link, but it is missing or misspelled (for example, Contakt).'
    ).toHaveCount(1);
    await appHeaderPage.goToContact();
    await expect(
      page,
      'Navigation regression: clicking Contact should open the contact page URL.'
    ).toHaveURL(/contact/);

    const homeLink = page.getByRole('link', { name: /^Home$/ });
    await expect(homeLink, 'Header regression: expected a Home link in the main navigation.').toHaveCount(1);
    await appHeaderPage.goToHome();
    await expect(page, 'Navigation regression: clicking Home should return to the homepage.').toHaveURL(/\/$|#\/$/);
  });
});

if (env.isBuggyTarget) {
  test.describe('Bug Hunt - Login integrity checks', () => {
    const usersToVerify = [accounts.jane, accounts.jack, accounts.bob];

    for (const user of usersToVerify) {
      test(`login works and header displays full name for ${user.firstName} ${user.lastName}`, async ({ authPage, page }) => {
        await authPage.login(user.email, user.password);
        await expect(
          page,
          `Login regression for ${user.firstName} ${user.lastName}: successful login should redirect to an account route.`
        ).toHaveURL(/account/);
        await expect(
          page.getByRole('button', { name: new RegExp(`${user.firstName} ${user.lastName}`, 'i') }),
          `Identity regression for ${user.firstName} ${user.lastName}: header should show the full authenticated user name.`
        ).toBeVisible();
        await expect(
          page.locator('text=/user data not found/i'),
          `Data regression for ${user.firstName} ${user.lastName}: UI should never show "user data not found" after successful login.`
        ).toHaveCount(0);
      });
    }
  });
}
