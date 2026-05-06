const HEADER = 'date,libelle,montant,categorie';

function isCurrentMonth(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

export function transactionsToCSV(transactions) {
  const rows = transactions
    .filter((t) => isCurrentMonth(t.date))
    .map((t) => `${t.date},${t.label},${t.amount},${t.category}`);
  return [HEADER, ...rows].join('\n');
}
