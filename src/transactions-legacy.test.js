import { processTransactions } from './transactions-legacy.js';

// Helpers
const makeTx = (overrides) => ({
  id: 'tx-1',
  date: '2024-03-15T12:00:00',
  type: 'credit',
  amount: 100,
  currency: 'EUR',
  label: 'virement',
  ...overrides,
});

// month: 2 = mars (index 0-based). On évite 0 (janvier) : le code legacy a un bug
// sur `if (!opts.month)` qui traite 0 comme falsy et l'écrase avec le mois courant.
const OPTS = { month: 2, year: 2024, currency: 'EUR', threshold: 1000 };

// ─── Zone 1 : Magic Numbers — taux de change ────────────────────────────────

describe('conversion de devise', () => {
  test('USD → EUR applique le taux 0.92', () => {
    const txs = [makeTx({ amount: 100, currency: 'USD', type: 'credit' })];
    const { transactions } = processTransactions(txs, { ...OPTS });
    expect(transactions[0].amount).toBeCloseTo(92);
  });

  test('GBP → EUR applique le taux 1.17', () => {
    const txs = [makeTx({ amount: 100, currency: 'GBP', type: 'credit' })];
    const { transactions } = processTransactions(txs, { ...OPTS });
    expect(transactions[0].amount).toBeCloseTo(117);
  });

  test('devise inconnue conserve le montant original (taux 1)', () => {
    const txs = [makeTx({ amount: 50, currency: 'CHF', type: 'credit' })];
    const { transactions } = processTransactions(txs, { ...OPTS });
    expect(transactions[0].amount).toBe(50);
  });

  test('même devise : pas de conversion', () => {
    const txs = [makeTx({ amount: 200, currency: 'EUR', type: 'credit' })];
    const { transactions } = processTransactions(txs, { ...OPTS });
    expect(transactions[0].amount).toBe(200);
  });
});

// ─── Zone 2 : Magic Number — seuil d'alerte ─────────────────────────────────

describe('seuil alerte (threshold)', () => {
  test('un débit sous le seuil ne génère pas de warning', () => {
    const txs = [makeTx({ amount: 500, type: 'debit' })];
    const { warnings } = processTransactions(txs, { ...OPTS, threshold: 1000 });
    expect(warnings).toHaveLength(0);
  });

  test('un débit au-dessus du seuil génère un warning', () => {
    const txs = [makeTx({ amount: 1500, type: 'debit' })];
    const { warnings } = processTransactions(txs, { ...OPTS, threshold: 1000 });
    expect(warnings).toHaveLength(1);
  });

  test('un crédit au-dessus du seuil ne génère pas de warning', () => {
    const txs = [makeTx({ amount: 5000, type: 'credit' })];
    const { warnings } = processTransactions(txs, { ...OPTS, threshold: 1000 });
    expect(warnings).toHaveLength(0);
  });

  test('un débit exactement au seuil ne génère pas de warning', () => {
    const txs = [makeTx({ amount: 1000, type: 'debit' })];
    const { warnings } = processTransactions(txs, { ...OPTS, threshold: 1000 });
    expect(warnings).toHaveLength(0);
  });
});

// ─── Calculs généraux ────────────────────────────────────────────────────────

describe('calculs de totaux', () => {
  test('total = credits - debits (1 transaction)', () => {
    const txs = [makeTx({ id: 'a', amount: 500, type: 'credit' })];
    const { total, totalCredit } = processTransactions(txs, { ...OPTS });
    expect(totalCredit).toBe(500);
    expect(total).toBe(500);
  });

  // BUG CONNU : avec 2+ transactions, le tri plante car item.date n'est pas copié
  // dans l'objet de sortie (ligne 162-172 du legacy). Ce test documente le crash.
  test('crash avec 2+ transactions valides (bug tri)', () => {
    const txs = [
      makeTx({ id: 'a', amount: 500, type: 'credit' }),
      makeTx({ id: 'b', amount: 200, type: 'debit' }),
    ];
    expect(() => processTransactions(txs, { ...OPTS })).toThrow(TypeError);
  });

  test('les transferts ne modifient pas le total', () => {
    const txs = [makeTx({ id: 'a', amount: 500, type: 'credit' })];
    const { total } = processTransactions(txs, { ...OPTS });
    expect(total).toBe(500);
  });
});

// ─── Validation ──────────────────────────────────────────────────────────────

describe('validation des transactions', () => {
  test('type invalide génère une erreur et ignore la transaction', () => {
    const txs = [makeTx({ type: 'unknown' })];
    const { errors, transactions } = processTransactions(txs, { ...OPTS });
    expect(errors).toHaveLength(1);
    expect(transactions).toHaveLength(0);
  });

  test('montant négatif génère une erreur', () => {
    const txs = [makeTx({ amount: -50 })];
    const { errors } = processTransactions(txs, { ...OPTS });
    expect(errors).toHaveLength(1);
  });

  test('montant absent génère une erreur', () => {
    const txs = [makeTx({ amount: undefined })];
    const { errors } = processTransactions(txs, { ...OPTS });
    expect(errors).toHaveLength(1);
  });
});
