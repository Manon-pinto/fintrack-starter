const HEADER = 'date,libelle,montant,categorie';

function escapeField(value) {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function isCurrentMonth(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

export function transactionsToCSV(transactions) {
  const rows = transactions
    .filter((t) => isCurrentMonth(t.date))
    .map((t) => [t.date, t.label, t.amount, t.category].map(escapeField).join(','));
  return [HEADER, ...rows].join('\n');
}
