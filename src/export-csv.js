const HEADER = 'date,libelle,montant,categorie';

export function transactionsToCSV(transactions) {
  const rows = transactions.map((t) => `${t.date},${t.label},${t.amount},${t.category}`);
  return [HEADER, ...rows].join('\n');
}
