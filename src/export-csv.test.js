import { transactionsToCSV } from './export-csv';

// Cycle 1 : en-tête
test('returns CSV header when given an empty array', () => {
  expect(transactionsToCSV([])).toBe('date,libelle,montant,categorie');
});
