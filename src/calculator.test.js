import {
  add,
  subtract,
  multiply,
  divide,
  modulo,
  simpleInterest,
  compoundInterest,
} from './calculator';

// Tests de la fonction d'addition
describe('add', () => {
  // Vérifie que 2 + 3 = 5 (cas nominal)
  it('retourne 5 quand on additionne 2 et 3', () => {
    expect(add(2, 3)).toBe(5);
  });
});

// Tests de la fonction de soustraction
describe('subtract', () => {
  // Vérifie que 7 - 3 = 4 (cas nominal)
  it('retourne 4 quand on soustrait 3 de 7', () => {
    expect(subtract(7, 3)).toBe(4);
  });
});

// Tests de la fonction de multiplication
describe('multiply', () => {
  // Vérifie que 4 × 3 = 12 (cas nominal)
  it('retourne 12 quand on multiplie 4 par 3', () => {
    expect(multiply(4, 3)).toBe(12);
  });
});

// Tests de la fonction de division
describe('divide', () => {
  // Vérifie que 10 / 2 = 5 (cas nominal)
  it('retourne 5 quand on divise 10 par 2', () => {
    expect(divide(10, 2)).toBe(5);
  });

  // Vérifie le comportement sur une division par zéro : en JS, x/0 vaut Infinity
  it('retourne Infinity quand on divise par zéro', () => {
    expect(divide(10, 0)).toBe(Infinity);
  });
});

// Tests de la fonction modulo (reste de la division euclidienne)
describe('modulo', () => {
  // Vérifie que 10 % 3 = 1 (10 = 3×3 + 1)
  it('retourne 1 quand on fait 10 % 3', () => {
    expect(modulo(10, 3)).toBe(1);
  });
});

// Tests de la fonction d'intérêt simple : I = capital × taux × durée / 100
describe('simpleInterest', () => {
  // Vérifie que 1000 × 5% × 3 ans = 150
  it('retourne 150 pour un capital de 1000, taux 5%, durée 3 ans', () => {
    expect(simpleInterest(1000, 5, 3)).toBe(150);
  });
});

// Tests de la fonction d'intérêt composé : I = capital × ((1 + taux/100)^durée - 1)
describe('compoundInterest', () => {
  // Vérifie que 1000 × ((1.05)^3 - 1) ≈ 157.63 ; toBeCloseTo(x, 2) tolère ±0.005
  it('retourne environ 157.63 pour un capital de 1000, taux 5%, durée 3 ans', () => {
    expect(compoundInterest(1000, 5, 3)).toBeCloseTo(157.63, 2);
  });
});
