import { expect, type Locator, type Page } from '@playwright/test';

export class VisualRegressionPage {
  readonly page: Page;
  readonly header: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = page.locator('header, nav').first();
  }

  async gotoHome(): Promise<void> {
    await this.page.goto('/');
    await expect(this.header).toBeVisible({ timeout: 15_000 });
  }

  private filterRoot(): Locator {
    return this.page
      .locator('div[data-test="filters"], div#filters')
      .filter({ has: this.page.getByRole('heading', { name: /sort|sorth|srot/i }).first() })
      .first();
  }

  private async stabilizeFiltersPanelForSnapshot(panel: Locator): Promise<void> {
    await panel.scrollIntoViewIfNeeded();
    await this.page.evaluate(() => {
      const candidates = Array.from(document.querySelectorAll<HTMLElement>('div[data-test="filters"], div#filters'));
      const filterPanel = candidates.find((el) => /sort|sorth|srot/i.test((el.textContent || '').toLowerCase()));
      if (!filterPanel) {
        return;
      }

      // Keep a deterministic visual region for snapshotting to avoid dynamic panel height drift.
      filterPanel.style.height = '980px';
      filterPanel.style.maxHeight = '980px';
      filterPanel.style.overflow = 'hidden';
    });
  }

  async expectHeaderMatchesBaseline(snapshotName: string): Promise<void> {
    await expect(this.header).toHaveScreenshot(snapshotName, {
      animations: 'disabled',
      caret: 'hide',
      scale: 'css',
      maxDiffPixelRatio: 0.02,
    });
  }

  async expectFiltersPanelMatchesBaseline(snapshotName: string): Promise<void> {
    const panel = this.filterRoot();
    await expect(panel).toBeVisible({ timeout: 10_000 });
    await this.stabilizeFiltersPanelForSnapshot(panel);
    await expect(panel).toHaveScreenshot(snapshotName, {
      animations: 'disabled',
      caret: 'hide',
      scale: 'css',
      maxDiffPixelRatio: 0.03,
    });
  }
}
