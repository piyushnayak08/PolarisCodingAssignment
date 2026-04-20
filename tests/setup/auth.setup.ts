import fs from 'fs';
import path from 'path';
import { expect, test as setup } from '@playwright/test';
import { accounts, defaultUiAccount } from '../../src/data/accounts';
import { AuthPage } from '../../src/pages/auth.page';

const authFile = path.join(process.cwd(), 'playwright', '.auth', 'user.json');

setup('authenticate default ui user', async ({ page }) => {
  fs.mkdirSync(path.dirname(authFile), { recursive: true });

  const authPage = new AuthPage(page);
  await authPage.login(defaultUiAccount.email, defaultUiAccount.password);

  await expect(page.getByRole('button', { name: new RegExp(`${accounts.jane.firstName} ${accounts.jane.lastName}`, 'i') })).toBeVisible({
    timeout: 15_000,
  });

  await page.context().storageState({ path: authFile });
});
