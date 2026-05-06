import { transactionsToCSV } from './export-csv';

function dateInCurrentMonth(day = 1) {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function dateInLastMonth() {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

// Cycle 1 : tableau vide retourne juste l'en-tête
test('returns CSV header when given an empty array', () => {
  expect(transactionsToCSV([])).toBe('date,libelle,montant,categorie');
});

// Cycle 2 : chaque transaction devient une ligne CSV
test('each transaction becomes a CSV row', () => {
  const transactions = [{ date: '2026-05-01', label: 'Loyer', amount: 800, category: 'logement' }];
  expect(transactionsToCSV(transactions)).toBe(
    'date,libelle,montant,categorie\n2026-05-01,Loyer,800,logement',
  );
});

// Cycle 3 : filtrage du mois en cours
test('filters out transactions from other months', () => {
  const transactions = [
    { date: dateInCurrentMonth(), label: 'Loyer', amount: 800, category: 'logement' },
    { date: dateInLastMonth(), label: 'Ancien', amount: 50, category: 'autre' },
  ];
  const csv = transactionsToCSV(transactions);
  expect(csv).toContain('Loyer');
  expect(csv).not.toContain('Ancien');
});

// Cycle 4 : échappement RFC 4180
test('wraps field in quotes if it contains a comma', () => {
  const transactions = [
    {
      date: dateInCurrentMonth(),
      label: 'Courses, supermarché',
      amount: 42,
      category: 'alimentation',
    },
  ];
  expect(transactionsToCSV(transactions)).toContain('"Courses, supermarché"');
});

test('doubles internal quotes in a field', () => {
  const transactions = [
    { date: dateInCurrentMonth(), label: 'Achat "premium"', amount: 10, category: 'autre' },
  ];
  expect(transactionsToCSV(transactions)).toContain('"Achat ""premium"""');
});
