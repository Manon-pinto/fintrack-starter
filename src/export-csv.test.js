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
test('given an empty transaction list, when exporting, then returns only the CSV header', () => {
  expect(transactionsToCSV([])).toBe('date,libelle,montant,categorie');
});

// Cycle 2 : chaque transaction devient une ligne CSV
test('given one transaction, when exporting, then it appears as a CSV row below the header', () => {
  const transactions = [{ date: '2026-05-01', label: 'Loyer', amount: 800, category: 'logement' }];
  expect(transactionsToCSV(transactions)).toBe(
    'date,libelle,montant,categorie\n2026-05-01,Loyer,800,logement',
  );
});

// Cycle 3 : filtrage du mois en cours
test('given transactions from this month and last month, when exporting, then only this month is included', () => {
  const transactions = [
    { date: dateInCurrentMonth(), label: 'Loyer', amount: 800, category: 'logement' },
    { date: dateInLastMonth(), label: 'Ancien', amount: 50, category: 'autre' },
  ];
  const csv = transactionsToCSV(transactions);
  expect(csv).toContain('Loyer');
  expect(csv).not.toContain('Ancien');
});

// Cycle 4 : échappement RFC 4180
test('given a label with a comma, when exporting, then the field is wrapped in quotes', () => {
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

test('given a label with internal quotes, when exporting, then quotes are doubled per RFC 4180', () => {
  const transactions = [
    { date: dateInCurrentMonth(), label: 'Achat "premium"', amount: 10, category: 'autre' },
  ];
  expect(transactionsToCSV(transactions)).toContain('"Achat ""premium"""');
});
