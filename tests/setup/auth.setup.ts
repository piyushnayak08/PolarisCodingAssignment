import fs from 'fs';
import path from 'path';
import { expect, test as setup } from '@playwright/test';
import { defaultUiAccount } from '../../src/data/accounts';
import { AuthPage } from '../../src/pages/auth.page';

const authFile = path.join(process.cwd(), 'playwright', '.auth', 'user.json');

setup('authenticate default ui user', async ({ page }) => {
  fs.mkdirSync(path.dirname(authFile), { recursive: true });

  const authPage = new AuthPage(page);
  await authPage.login(defaultUiAccount.email, defaultUiAccount.password);

  // Verify session by opening account page; buggy target can render inconsistent header identity text.
  await page.goto('/account');
  await expect(page).toHaveURL(/account|#\/account/i, { timeout: 15_000 });

  await page.context().storageState({ path: authFile });
});
