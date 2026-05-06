export class FinTrackPage {
  constructor(page) {
    this.page = page;
    this.balance = page.getByTestId('balance');
    this.transactionList = page.getByTestId('transaction-list');
  }

  async goto() {
    await this.page.goto('/');
  }

  async openAddForm() {
    await this.page.getByRole('button', { name: 'Ajouter une transaction' }).click();
  }

  async fillForm({ label, amount, type = 'debit', category = 'autre' }) {
    await this.page.getByLabel('Libellé').fill(label);
    await this.page.getByLabel('Montant').fill(String(amount));
    if (type !== 'debit') await this.page.getByLabel('Type').selectOption(type);
    if (category !== 'autre') await this.page.getByLabel('Catégorie').selectOption(category);
  }

  async submit() {
    await this.page.getByRole('button', { name: 'Valider' }).click();
  }

  async addTransaction(tx) {
    await this.openAddForm();
    await this.fillForm(tx);
    await this.submit();
  }

  async getBalance() {
    const text = await this.balance.textContent();
    return parseFloat(text.replace(/[^\d.-]/g, ''));
  }

  async startCSVDownload() {
    const download = this.page.waitForEvent('download');
    await this.page.getByRole('button', { name: 'Exporter en CSV' }).click();
    return download;
  }
}
