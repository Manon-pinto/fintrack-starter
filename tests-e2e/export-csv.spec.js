import { test, expect } from '@playwright/test';
import { FinTrackPage } from './pages/FinTrackPage.js';

test('clicking Export CSV triggers a file download', async ({ page }) => {
  const app = new FinTrackPage(page);
  await app.goto();

  const download = await app.startCSVDownload();

  expect(download.suggestedFilename()).toBe('transactions.csv');
});
