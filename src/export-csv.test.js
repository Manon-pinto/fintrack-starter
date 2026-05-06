import { transactionsToCSV } from './export-csv';

// Cycle 1 : en-tête
test('returns CSV header when given an empty array', () => {
  expect(transactionsToCSV([])).toBe('date,libelle,montant,categorie');
});

// Cycle 2 : lignes
test('each transaction becomes a CSV row', () => {
  const transactions = [{ date: '2026-05-01', label: 'Loyer', amount: 800, category: 'logement' }];
  expect(transactionsToCSV(transactions)).toBe(
    'date,libelle,montant,categorie\n2026-05-01,Loyer,800,logement',
  );
});
