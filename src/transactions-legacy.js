// FinTrack — Module historique de gestion des transactions
//
// ⚠ ATTENTION : Ce fichier date des débuts du projet (2019).
//   Il fonctionne mais il est devenu difficile à maintenir.
//   Personne dans l'équipe actuelle ne l'a écrit.
//
//   La direction a demandé un audit complet de ce module.
//   À toi de jouer.

// ============================================================================

const TYPES = ['credit', 'debit', 'transfer'];

function categorize(label) {
  if (!label) return 'autre';
  const lab = label.toLowerCase();
  if (lab.indexOf('loyer') >= 0 || lab.indexOf('rent') >= 0) return 'logement';
  if (lab.indexOf('course') >= 0 || lab.indexOf('groce') >= 0 || lab.indexOf('super') >= 0)
    return 'alimentation';
  if (lab.indexOf('essence') >= 0 || lab.indexOf('gas') >= 0 || lab.indexOf('uber') >= 0)
    return 'transport';
  if (lab.indexOf('netflix') >= 0 || lab.indexOf('spotify') >= 0 || lab.indexOf('cinema') >= 0)
    return 'loisirs';
  if (lab.indexOf('salaire') >= 0 || lab.indexOf('salary') >= 0) return 'revenu';
  return 'autre';
}

const DEFAULT_THRESHOLD = 1000;

const EXCHANGE_RATES = {
  'USD→EUR': 0.92,
  'EUR→USD': 1.08,
  'GBP→EUR': 1.17,
  'EUR→GBP': 0.85,
};

// THE function
export function processTransactions(txs, opts) {
  const result = [];
  let total = 0;
  let totalCredit = 0;
  let totalDebit = 0;
  let nbCredit = 0;
  let nbDebit = 0;
  const errors = [];
  const warnings = [];
  let i, j;
  let tx;
  let rate;
  let converted;
  let category;

  // si pas d'options on met des valeurs par défaut
  if (!opts) {
    opts = {};
  }
  if (!opts.currency) {
    opts.currency = 'EUR';
  }
  if (!opts.month) {
    opts.month = new Date().getMonth();
  }
  if (!opts.year) {
    opts.year = new Date().getFullYear();
  }
  if (opts.threshold === undefined) {
    opts.threshold = DEFAULT_THRESHOLD;
  }

  const threshold = opts.threshold;
  const month = opts.month;
  const year = opts.year;

  // boucle principale
  for (i = 0; i < txs.length; i++) {
    tx = txs[i];

    // on filtre par mois et par année
    const d = new Date(tx.date);
    if (d.getMonth() !== month) {
      continue;
    }
    if (d.getFullYear() !== year) {
      continue;
    }

    // on vérifie le type
    let typeOk = false;
    for (j = 0; j < TYPES.length; j++) {
      if (TYPES[j] === tx.type) {
        typeOk = true;
      }
    }
    if (!typeOk) {
      errors.push('transaction ' + i + ' has invalid type');
      continue;
    }

    // on vérifie le montant
    if (tx.amount === undefined || tx.amount === null) {
      errors.push('transaction ' + i + ' has no amount');
      continue;
    }
    if (typeof tx.amount !== 'number') {
      errors.push('transaction ' + i + ' amount is not a number');
      continue;
    }
    if (tx.amount < 0) {
      errors.push('transaction ' + i + ' has negative amount');
      continue;
    }

    // conversion devise si besoin
    if (tx.currency && tx.currency !== opts.currency) {
      const pair = `${tx.currency}→${opts.currency}`;
      rate = EXCHANGE_RATES[pair] ?? 1;
      converted = tx.amount * rate;
    } else {
      converted = tx.amount;
    }

    category = categorize(tx.label);

    // alertes
    if (converted > threshold && tx.type === 'debit') {
      warnings.push(
        'transaction ' + i + ' depasse le seuil (' + converted + ' > ' + threshold + ')',
      );
    }

    // calculs
    if (tx.type === 'credit') {
      total = total + converted;
      totalCredit = totalCredit + converted;
      nbCredit = nbCredit + 1;
    } else if (tx.type === 'debit') {
      total = total - converted;
      totalDebit = totalDebit + converted;
      nbDebit = nbDebit + 1;
    } else if (tx.type === 'transfer') {
      // les transferts ne changent pas le total
    }

    // construction de l'objet de sortie
    const item = {};
    item.id = tx.id;
    item.label = tx.label || '(sans libellé)';
    item.amount = converted;
    item.originalAmount = tx.amount;
    item.originalCurrency = tx.currency || opts.currency;
    item.currency = opts.currency;
    item.type = tx.type;
    item.category = category;
    item.flagged = converted > threshold && tx.type === 'debit';
    result.push(item);
  }

  // tri par date (un peu pourri mais ça marche)
  result.sort((a, b) => {
    const pa = a.date.split('/');
    const pb = b.date.split('/');
    const da = new Date(pa[2], pa[1] - 1, pa[0]);
    const db = new Date(pb[2], pb[1] - 1, pb[0]);
    if (da < db) return -1;
    if (da > db) return 1;
    return 0;
  });

  // moyenne (au cas ou)
  let avgCredit = 0;
  if (nbCredit > 0) {
    avgCredit = totalCredit / nbCredit;
  }
  let avgDebit = 0;
  if (nbDebit > 0) {
    avgDebit = totalDebit / nbDebit;
  }

  return {
    transactions: result,
    total,
    totalCredit,
    totalDebit,
    nbCredit,
    nbDebit,
    avgCredit,
    avgDebit,
    errors,
    warnings,
  };
}
