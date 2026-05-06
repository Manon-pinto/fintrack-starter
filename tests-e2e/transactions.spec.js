import { test, expect } from '@playwright/test';

test('ajouter une transaction et la voir apparaître dans la liste', async ({ page }) => {
  // 1. L'utilisateur arrive sur la page d'accueil
  await page.goto('/');

  // 2. Il clique sur le bouton « Ajouter une transaction »
  await page.getByRole('button', { name: 'Ajouter une transaction' }).click();

  // 3. Il remplit le formulaire
  await page.getByLabel('Libellé').fill('Café');
  await page.getByLabel('Montant').fill('3.50');

  // La catégorie n'a pas d'option directement testable par getByLabel seul pour le select,
  // on utilise getByLabel qui cible le <select id="category">
  await page.getByLabel('Catégorie').selectOption('alimentation');

  // 4. Il valide
  await page.getByRole('button', { name: 'Valider' }).click();

  // 5. La nouvelle transaction apparaît dans la liste avec les bonnes valeurs
  const list = page.getByTestId('transaction-list');

  // Le libellé est visible
  await expect(list.getByText('Café')).toBeVisible();

  // Le montant affiché (format « - 3.50 € »)
  await expect(list.getByTestId('transaction-item').first()).toContainText('3.50');

  // La catégorie est affichée
  await expect(list.getByTestId('transaction-item').first()).toContainText('alimentation');
});
