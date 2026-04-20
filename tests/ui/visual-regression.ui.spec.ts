import { test } from '../../src/fixtures/ui.fixture';
import { VisualRegressionPage } from '../../src/pages/visual-regression.page';

test.describe('Visual Regression - Main vs Buggy consistency', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('header visual baseline', async ({ page }) => {
    const visualPage = new VisualRegressionPage(page);
    await visualPage.gotoHome();
    await visualPage.expectHeaderMatchesBaseline('header-baseline.png');
  });

  test('catalog filters visual baseline', async ({ page }) => {
    const visualPage = new VisualRegressionPage(page);
    await visualPage.gotoHome();
    await visualPage.expectFiltersPanelMatchesBaseline('filters-baseline.png');
  });
});
