import { test, expect } from '@playwright/test';
import { FinTrackPage } from './pages/FinTrackPage.js';

test('adding a transaction shows it in the list', async ({ page }) => {
  const app = new FinTrackPage(page);
  await app.goto();

  await app.addTransaction({ label: 'Café', amount: '3.50', category: 'alimentation' });

  await expect(app.transactionList.getByText('Café')).toBeVisible();
  await expect(app.transactionList.getByTestId('transaction-item').first()).toContainText('3.50');
  await expect(app.transactionList.getByTestId('transaction-item').first()).toContainText(
    'alimentation',
  );
});
