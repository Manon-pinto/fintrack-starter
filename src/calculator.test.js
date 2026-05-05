import {
  add,
  subtract,
  multiply,
  divide,
  modulo,
  simpleInterest,
  compoundInterest,
  convertCurrency,
  computeBalance,
  formatAmount,
  interestSinceDate,
} from './calculator';

// ---------------------------------------------------------------------------
// add
// ---------------------------------------------------------------------------
describe('add', () => {
  it('retourne 5 quand on additionne 2 et 3', () => {
    expect(add(2, 3)).toBe(5);
  });

  it('retourne 0 quand on additionne 0 et 0', () => {
    expect(add(0, 0)).toBe(0);
  });

  it('conserve la précision avec Number.MAX_SAFE_INTEGER', () => {
    expect(add(Number.MAX_SAFE_INTEGER, 0)).toBe(Number.MAX_SAFE_INTEGER);
  });

  it("concatène les chaînes au lieu d'additionner (comportement JS natif)", () => {
    expect(add('a', 2)).toBe('a2');
  });
});

// ---------------------------------------------------------------------------
// subtract
// ---------------------------------------------------------------------------
describe('subtract', () => {
  it('retourne 4 quand on soustrait 3 de 7', () => {
    expect(subtract(7, 3)).toBe(4);
  });

  it('retourne un nombre négatif quand b > a', () => {
    expect(subtract(3, 7)).toBe(-4);
  });

  it('retourne 0 quand a === b', () => {
    expect(subtract(5, 5)).toBe(0);
  });

  it('retourne NaN si une entrée est non numérique', () => {
    expect(subtract('x', 1)).toBeNaN();
  });
});

// ---------------------------------------------------------------------------
// multiply
// ---------------------------------------------------------------------------
describe('multiply', () => {
  it('retourne 12 quand on multiplie 4 par 3', () => {
    expect(multiply(4, 3)).toBe(12);
  });

  it('retourne 0 quand on multiplie par 0', () => {
    expect(multiply(999, 0)).toBe(0);
  });

  it('retourne un résultat correct avec Number.MAX_SAFE_INTEGER × 1', () => {
    expect(multiply(Number.MAX_SAFE_INTEGER, 1)).toBe(Number.MAX_SAFE_INTEGER);
  });

  it('retourne NaN si une entrée est non numérique', () => {
    expect(multiply(2, 'deux')).toBeNaN();
  });
});

// ---------------------------------------------------------------------------
// divide
// ---------------------------------------------------------------------------
describe('divide', () => {
  it('retourne 5 quand on divise 10 par 2', () => {
    expect(divide(10, 2)).toBe(5);
  });

  it("lève une erreur explicite lors d'une division par zéro", () => {
    expect(() => divide(10, 0)).toThrow('Division par zéro interdite');
  });

  it("lève une erreur (pas Infinity) lors d'une division par zéro", () => {
    expect(() => divide(5, 0)).toThrow();
  });

  it('retourne NaN si le numérateur est non numérique', () => {
    expect(divide('a', 2)).toBeNaN();
  });
});

// ---------------------------------------------------------------------------
// modulo
// ---------------------------------------------------------------------------
describe('modulo', () => {
  it('retourne 1 quand on fait 10 % 3', () => {
    expect(modulo(10, 3)).toBe(1);
  });

  it('retourne 0 quand le dividende est un multiple du diviseur', () => {
    expect(modulo(9, 3)).toBe(0);
  });

  it('retourne NaN pour un modulo par zéro', () => {
    expect(modulo(5, 0)).toBeNaN();
  });

  it('retourne NaN si une entrée est non numérique', () => {
    expect(modulo('x', 3)).toBeNaN();
  });
});

// ---------------------------------------------------------------------------
// simpleInterest
// ---------------------------------------------------------------------------
describe('simpleInterest', () => {
  it('retourne 150 pour un capital de 1000, taux 5%, durée 3 ans', () => {
    expect(simpleInterest(1000, 5, 3)).toBe(150);
  });

  it('retourne 0 quand le capital est 0', () => {
    expect(simpleInterest(0, 5, 3)).toBe(0);
  });

  it('retourne 0 quand la durée est 0', () => {
    expect(simpleInterest(1000, 5, 0)).toBe(0);
  });

  it('retourne NaN si le taux est non numérique', () => {
    expect(simpleInterest(1000, 'cinq', 3)).toBeNaN();
  });
});

// ---------------------------------------------------------------------------
// compoundInterest
// ---------------------------------------------------------------------------
describe('compoundInterest', () => {
  it('retourne environ 157.63 pour un capital de 1000, taux 5%, durée 3 ans', () => {
    expect(compoundInterest(1000, 5, 3)).toBeCloseTo(157.63, 2);
  });

  it('retourne 0 quand le capital est 0', () => {
    expect(compoundInterest(0, 5, 3)).toBe(0);
  });

  it('retourne 0 quand la durée est 0', () => {
    expect(compoundInterest(1000, 5, 0)).toBe(0);
  });

  it('retourne NaN si la durée est non numérique', () => {
    expect(compoundInterest(1000, 5, 'trois')).toBeNaN();
  });
});

// ---------------------------------------------------------------------------
// convertCurrency
// ---------------------------------------------------------------------------
describe('convertCurrency', () => {
  it('convertit 100 USD avec un taux de 0.92 en 92 EUR', () => {
    expect(convertCurrency(100, 0.92)).toBeCloseTo(92, 2);
  });

  it('retourne 0 quand le montant est 0', () => {
    expect(convertCurrency(0, 1.5)).toBe(0);
  });

  it('retourne une valeur négative pour un taux négatif (bug connu)', () => {
    expect(convertCurrency(100, -1)).toBe(-100);
  });

  it('retourne NaN si le taux est non numérique', () => {
    expect(convertCurrency(100, 'euro')).toBeNaN();
  });
});

// ---------------------------------------------------------------------------
// computeBalance
// ---------------------------------------------------------------------------
describe('computeBalance', () => {
  it('calcule correctement un solde mixte crédit/débit', () => {
    const txs = [
      { amount: 200, type: 'credit' },
      { amount: 50, type: 'debit' },
    ];
    expect(computeBalance(txs)).toBe(150);
  });

  it('retourne 0 pour un tableau vide', () => {
    expect(computeBalance([])).toBe(0);
  });

  it('lève une erreur ou retourne 0 si transactions est null', () => {
    expect(() => computeBalance(null)).toThrow();
  });

  it('ignore les types inconnus en les traitant comme débit', () => {
    const txs = [{ amount: 100, type: 'unknown' }];
    expect(computeBalance(txs)).toBe(-100);
  });
});

// ---------------------------------------------------------------------------
// formatAmount
// ---------------------------------------------------------------------------
describe('formatAmount', () => {
  it('formate 1000 EUR en "1000.00 €"', () => {
    expect(formatAmount(1000, 'EUR')).toBe('1000.00 €');
  });

  it('utilise EUR par défaut', () => {
    expect(formatAmount(50)).toBe('50.00 €');
  });

  it('utilise le code devise si le symbole est inconnu', () => {
    expect(formatAmount(10, 'CHF')).toBe('10.00 CHF');
  });

  it('lève une erreur si le montant est non numérique (toFixed)', () => {
    expect(() => formatAmount('abc')).toThrow();
  });
});

// ---------------------------------------------------------------------------
// interestSinceDate — mock de Date.now
// ---------------------------------------------------------------------------
describe('interestSinceDate', () => {
  const FIXED_NOW = 1700000000000; // timestamp figé

  beforeAll(() => {
    jest.spyOn(Date, 'now').mockReturnValue(FIXED_NOW);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('retourne 0 quand startTimestamp === Date.now() (aucun temps écoulé)', () => {
    expect(interestSinceDate(1000, 5, FIXED_NOW)).toBeCloseTo(0, 5);
  });

  it("calcule correctement l'intérêt après exactement 1 an (365.25 jours)", () => {
    const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;
    const oneYearAgo = FIXED_NOW - MS_PER_YEAR;
    expect(interestSinceDate(1000, 5, oneYearAgo)).toBeCloseTo(50, 5);
  });

  it('le mock ne fuit pas : Date.now reste figé dans ce describe', () => {
    expect(Date.now()).toBe(FIXED_NOW);
  });
});

// Test d'isolation : vérifie que Date.now est restauré après le describe précédent
describe('isolation du mock Date.now', () => {
  it('Date.now() retourne la valeur réelle en dehors du bloc mocké', () => {
    const now = Date.now();
    expect(now).not.toBe(1700000000000);
    expect(typeof now).toBe('number');
  });
});
