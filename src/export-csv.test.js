import { transactionsToCSV } from './export-csv';

// Cycle 1 : en-tête
test('returns CSV header when given an empty array', () => {
  expect(transactionsToCSV([])).toBe('date,libelle,montant,categorie');
});

// Cycle 3 : filtrage du mois en cours
test('filters out transactions from other months', () => {
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthStr = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}-01`;
  const transactions = [
    { date: thisMonth, label: 'Loyer', amount: 800, category: 'logement' },
    { date: lastMonthStr, label: 'Ancien', amount: 50, category: 'autre' },
  ];
  const csv = transactionsToCSV(transactions);
  expect(csv).toContain('Loyer');
  expect(csv).not.toContain('Ancien');
});

// Cycle 2 : lignes
test('each transaction becomes a CSV row', () => {
  const transactions = [{ date: '2026-05-01', label: 'Loyer', amount: 800, category: 'logement' }];
  expect(transactionsToCSV(transactions)).toBe(
    'date,libelle,montant,categorie\n2026-05-01,Loyer,800,logement',
  );
});
