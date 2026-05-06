import { test, expect } from '@playwright/test';
import { FinTrackPage } from './pages/FinTrackPage.js';

test('adding a credit increases the displayed balance', async ({ page }) => {
  const app = new FinTrackPage(page);
  await app.goto();

  const balanceBefore = await app.getBalance();

  await app.addTransaction({ label: 'Prime', amount: '500', type: 'credit', category: 'revenu' });

  const balanceAfter = await app.getBalance();
  expect(balanceAfter).toBeCloseTo(balanceBefore + 500, 2);
});
