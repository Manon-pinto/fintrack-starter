import { test, expect } from '@playwright/test';
import { FinTrackPage } from './pages/FinTrackPage.js';

// Parcours 1 : ajouter une transaction et la voir dans la liste
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

// Parcours 2 : ajouter un crédit met à jour le solde affiché
test('adding a credit increases the displayed balance', async ({ page }) => {
  const app = new FinTrackPage(page);
  await app.goto();

  const balanceBefore = await app.getBalance();

  await app.addTransaction({ label: 'Prime', amount: '500', type: 'credit', category: 'revenu' });

  const balanceAfter = await app.getBalance();
  expect(balanceAfter).toBeCloseTo(balanceBefore + 500, 2);
});

// Parcours 3 : le bouton Export CSV déclenche un téléchargement
test('clicking Export CSV triggers a file download', async ({ page }) => {
  const app = new FinTrackPage(page);
  await app.goto();

  const download = await app.startCSVDownload();

  expect(download.suggestedFilename()).toBe('transactions.csv');
});
