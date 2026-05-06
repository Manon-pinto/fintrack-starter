const HEADER = 'date,libelle,montant,categorie';

function escapeField(value) {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function currentYearMonth() {
  return new Date().toISOString().slice(0, 7);
}

function isCurrentMonth(dateStr) {
  return dateStr.slice(0, 7) === currentYearMonth();
}

export function transactionsToCSV(transactions) {
  const rows = transactions
    .filter((t) => isCurrentMonth(t.date))
    .map((t) => [t.date, t.label, t.amount, t.category].map(escapeField).join(','));
  return [HEADER, ...rows].join('\n');
}
