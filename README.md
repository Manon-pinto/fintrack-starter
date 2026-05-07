# FinTrack

[![CI](https://github.com/Manon-pinto/fintrack-starter/actions/workflows/ci.yml/badge.svg)](https://github.com/Manon-pinto/fintrack-starter/actions/workflows/ci.yml)

Application web de gestion de budget personnel. Elle permet de suivre ses transactions (dépenses et revenus), de visualiser son solde en temps réel, d'exporter ses données en CSV, et inclut un module legacy de traitement des transactions qui a fait l'objet d'un audit complet.

Projet fil rouge B3 Dev — My Digital School Bordeaux.

---

## Prérequis

- Node.js >= 18
- npm >= 9

---

## Installation

```bash
npm ci
```

---

## Lancement

| Commande | Description |
|----------|-------------|
| `npm run dev` | Démarre le serveur de développement sur http://localhost:5173 |
| `npm run build` | Compile l'application pour la production dans `dist/` |
| `npm run preview` | Prévisualise le build de production sur http://localhost:4173 |

---

## Tests

### Tests unitaires (Jest)

Couvrent les fonctions métier : calculs financiers, export CSV, utilitaires string, et le module legacy.

```bash
npm test
```

### Tests E2E (Playwright)

Simulent des parcours utilisateur réels dans un vrai navigateur : ajout de transaction, mise à jour du solde, export CSV.

```bash
npx playwright test
```

> Le serveur de développement (`npm run dev`) doit être démarré avant de lancer les tests E2E.

### Linter

```bash
npm run lint
```

---

## Structure du projet

```
fintrack-starter/
├── src/
│   ├── App.jsx                   # Interface principale (React)
│   ├── calculator.js             # Fonctions de calcul financier
│   ├── export-csv.js             # Export des transactions en CSV
│   ├── seed.js                   # Données de démarrage
│   ├── string-utils.js           # Utilitaires de formatage
│   └── transactions-legacy.js    # Module historique (2019) — audité
├── tests-e2e/                    # Tests Playwright (E2E)
├── docs/
│   ├── audit.md                  # Audit du module legacy + éco-impact
│   ├── tests-strategy.md         # Stratégie de tests du projet
│   └── scenarios.md              # Scénarios de tests E2E
├── public/
├── eslint.config.js
├── playwright.config.js
└── vite.config.js
```

---

## Documentation

- [Audit du module legacy](docs/audit.md) — diagnostic, code smells, refactoring effectué, score Lighthouse
- [Stratégie de tests](docs/tests-strategy.md) — pyramide des tests, choix unitaire / intégration / E2E
- [Scénarios de tests](docs/scenarios.md) — parcours utilisateur couverts par les tests E2E

---

_My Digital School Bordeaux · B3 Dev · Qualité logicielle & tests_
