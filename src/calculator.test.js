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

describe('add', () => {
  it('retourne 5 quand on additionne 2 et 3', () => {
    expect(add(2, 3)).toBe(5);
  });
  it('retourne 0 quand on additionne 0 et 0', () => {
    expect(add(0, 0)).toBe(0);
  });
  it('conserve Number.MAX_SAFE_INTEGER sans perte de précision', () => {
    expect(add(Number.MAX_SAFE_INTEGER, 0)).toBe(Number.MAX_SAFE_INTEGER);
  });
});

describe('subtract', () => {
  it('retourne 4 quand on soustrait 3 de 7', () => {
    expect(subtract(7, 3)).toBe(4);
  });
  it('retourne un nombre négatif quand b > a', () => {
    expect(subtract(3, 7)).toBe(-4);
  });
});

describe('multiply', () => {
  it('retourne 12 quand on multiplie 4 par 3', () => {
    expect(multiply(4, 3)).toBe(12);
  });
  it('retourne 0 quand on multiplie par 0', () => {
    expect(multiply(999, 0)).toBe(0);
  });
  it('retourne NaN si une entrée est non numérique', () => {
    expect(multiply(2, 'deux')).toBeNaN();
  });
});

describe('divide', () => {
  it('retourne 5 quand on divise 10 par 2', () => {
    expect(divide(10, 2)).toBe(5);
  });
  it("lève une erreur explicite lors d'une division par zéro", () => {
    expect(() => divide(10, 0)).toThrow('Division par zéro interdite');
  });
});

describe('modulo', () => {
  it('retourne 1 quand on fait 10 % 3', () => {
    expect(modulo(10, 3)).toBe(1);
  });
  it('retourne NaN pour un modulo par zéro', () => {
    expect(modulo(5, 0)).toBeNaN();
  });
});

describe('simpleInterest', () => {
  it('retourne 150 pour un capital de 1000, taux 5%, durée 3 ans', () => {
    expect(simpleInterest(1000, 5, 3)).toBe(150);
  });
  it('retourne 0 quand le capital est 0', () => {
    expect(simpleInterest(0, 5, 3)).toBe(0);
  });
  it('retourne NaN si le taux est non numérique', () => {
    expect(simpleInterest(1000, 'cinq', 3)).toBeNaN();
  });
});

describe('compoundInterest', () => {
  it('retourne environ 157.63 pour un capital de 1000, taux 5%, durée 3 ans', () => {
    expect(compoundInterest(1000, 5, 3)).toBeCloseTo(157.63, 2);
  });
  it('retourne 0 quand le capital est 0', () => {
    expect(compoundInterest(0, 5, 3)).toBe(0);
  });
  it('retourne NaN si la durée est non numérique', () => {
    expect(compoundInterest(1000, 5, 'trois')).toBeNaN();
  });
});

describe('convertCurrency', () => {
  it('convertit 100 avec un taux de 0.92', () => {
    expect(convertCurrency(100, 0.92)).toBeCloseTo(92, 2);
  });
  it('retourne 0 quand le montant est 0', () => {
    expect(convertCurrency(0, 1.5)).toBe(0);
  });
});

describe('computeBalance', () => {
  it('calcule un solde mixte crédit/débit', () => {
    expect(
      computeBalance([
        { amount: 200, type: 'credit' },
        { amount: 50, type: 'debit' },
      ]),
    ).toBe(150);
  });
  it('retourne 0 pour un tableau vide', () => {
    expect(computeBalance([])).toBe(0);
  });
  it('lève une erreur si transactions est null', () => {
    expect(() => computeBalance(null)).toThrow();
  });
});

describe('formatAmount', () => {
  it('formate 1000 EUR en "1000.00 €"', () => {
    expect(formatAmount(1000, 'EUR')).toBe('1000.00 €');
  });
  it('utilise le code devise si le symbole est inconnu', () => {
    expect(formatAmount(10, 'CHF')).toBe('10.00 CHF');
  });
});

describe('interestSinceDate — mock de Date.now', () => {
  const FIXED_NOW = 1700000000000;

  beforeAll(() => {
    jest.spyOn(Date, 'now').mockReturnValue(FIXED_NOW);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("retourne 0 quand aucun temps ne s'est écoulé", () => {
    expect(interestSinceDate(1000, 5, FIXED_NOW)).toBeCloseTo(0, 5);
  });
});

describe('isolation du mock Date.now', () => {
  it('Date.now() retourne la valeur réelle en dehors du bloc mocké', () => {
    expect(Date.now()).not.toBe(1700000000000);
  });
});
