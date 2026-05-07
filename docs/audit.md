# Audit — `src/transactions-legacy.js`

## Diagnostic général

Le module exporte une seule fonction `processTransactions(txs, opts)` de 194 lignes. Elle prend en entrée un tableau de transactions brutes et un objet d'options, et retourne un résumé agrégé (totaux, moyennes, erreurs, alertes). La fonction prend une liste de transactions et en ressort un bilan : total dépensé, total reçu, moyennes, et les erreurs rencontrées. Elle couvre cinq responsabilités distinctes : normalisation des options, filtrage par période, validation des données, conversion de devises, catégorisation par libellé, calcul des totaux, et tri du résultat. Cette concentration de logique dans un seul bloc séquentiel rend le code lisible en première lecture mais très difficile à tester, à modifier ou à réutiliser. Le tri final plante silencieusement car `result` ne contient pas le champ `date` (il n'est jamais copié dans `item`). Les taux de change sont codés en dur et correspondent à des valeurs arbitraires de 2019. La catégorisation repose sur de la recherche de sous-chaînes fragiles sans couverture exhaustive.

---

## Risques identifiés

- **Zone : tri final (lignes 176–184)**
  Problème : `a.date` et `b.date` sont `undefined` — le champ `date` n'est jamais ajouté à `item` lors de la construction de l'objet de sortie (lignes 162–172).
  Impact : `a.date.split` lève une `TypeError` à l'exécution dès qu'il y a au moins deux transactions valides dans le mois. La fonction ne retourne rien dans ce cas.

- **Zone : taux de change codés en dur (lignes 93–103)**
  Problème : quatre paires de devises seulement, valeurs figées à 2019, fallback silencieux à `1` pour toute paire non gérée (ex. CHF/EUR, JPY/EUR).
  Impact : les montants convertis sont faux sans aucun avertissement ; les devises non reconnues passent comme si le taux était exact.

- **Zone : identification des erreurs par index (lignes 72, 78, 82, 86)**
  Problème : les messages d'erreur utilisent l'index `i` du tableau d'entrée (`'transaction ' + i + ' ...'`), pas l'identifiant métier `tx.id`.
  Impact : les erreurs sont inexploitables côté appelant si le tableau est filtré, paginé ou réordonné avant l'appel.

- **Zone : catégorisation par sous-chaîne (lignes 110–139)**
  Problème : détection basée sur `indexOf` avec une liste close de mots-clés ; `'gas'` catégorise aussi bien une station-service qu'un abonnement GazelEnergie ou un achat sur Wargames.
  Impact : faux positifs fréquents, couverture partielle — la majorité des transactions tombe dans `'autre'`.

- **Zone : mutation de l'objet `opts` en entrée (lignes 31–45)**
  Problème : les valeurs par défaut sont écrites directement sur l'objet `opts` passé par référence.
  Impact : l'appelant voit son objet modifié après l'appel, ce qui peut provoquer des effets de bord difficiles à tracer dans un contexte multi-appels ou React.

- **Zone : filtre de date (lignes 56–62)**
  Problème : `new Date(tx.date)` échoue silencieusement si `tx.date` est `undefined` ou mal formaté — `d` vaut `Invalid Date`, `d.getMonth()` retourne `NaN`, la condition `!== month` est `true`, et la transaction est ignorée sans erreur.
  Impact : des transactions valides peuvent disparaître du résultat sans message dans `errors`.

---

## Code smells identifiés

---

### [Long Method / Complexité cognitive excessive] — Priorité : Haute

Localisation : `src/transactions-legacy.js:15`

Constat : `processTransactions` fait 194 lignes. ESLint/SonarJS mesure sa complexité cognitive à **59**, soit presque 4× le seuil acceptable de 15. Elle mélange 7 responsabilités dans un seul bloc séquentiel : normalisation des options, filtrage par date, validation, conversion de devises, catégorisation, calculs, tri.

Impact : impossible à tester unitairement par étape, toute modification risque de casser un effet de bord ailleurs dans la même fonction. La complexité à 59 signifie qu'il faut tenir 59 chemins d'exécution en tête simultanément pour modifier le code sans régression.

Proposition : découper en fonctions dédiées — `normalizeOpts`, `filterByPeriod`, `validateTx`, `convertCurrency`, `categorize`, `computeSummary`.

---

### [Magic Number] — Priorité : Haute

Localisation : `src/transactions-legacy.js:93–103`

Constat : les taux de change (`0.92`, `1.08`, `1.17`, `0.85`) et le seuil par défaut (`1000`) sont des nombres littéraux sans nom ni explication.

Impact : personne ne sait si `0.92` est toujours valide, et modifier le seuil demande de chercher la valeur dans le code.

Proposition : extraire en constantes nommées : `const DEFAULT_THRESHOLD = 1000` et `const EXCHANGE_RATES = { 'USD→EUR': 0.92, ... }`.

---

### [God Object] — Priorité : Haute

Localisation : `src/transactions-legacy.js:15`

Constat : une seule fonction fait la totalité du travail du module — validation métier, conversion financière, règles de catégorisation, logique de tri, calcul de statistiques.

Impact : le moindre nouveau besoin (nouvelle devise, nouvelle catégorie, nouveau format de tri) touche la même fonction géante, augmentant le risque de régression.

Proposition : séparer en plusieurs modules ou helpers cohérents avec une responsabilité chacun.

---

### [Duplicate Code] — Priorité : Moyenne

Localisation : `src/transactions-legacy.js:57–62` et `src/transactions-legacy.js:176–183`

Constat : la date de la transaction est parsée deux fois avec deux logiques différentes — `new Date(tx.date)` dans le filtre, et un split manuel `dd/mm/yyyy` dans le tri — sans cohérence de format.

Impact : si le format de date change, il faut modifier deux endroits ; l'incohérence des formats provoque déjà le crash du tri (voir risques).

Proposition : créer une fonction `parseDate(str)` utilisée aux deux endroits, avec un format unique.

---

### [Variable Hoisting / Portée excessive] — Priorité : Moyenne

Localisation : `src/transactions-legacy.js:24–27`

Constat : `rate`, `converted`, `category` sont déclarées une fois en haut de la fonction et réassignées à chaque itération de la boucle. Elles gardent leur valeur entre les itérations — si une transaction est ignorée par `continue`, `category` conserve la valeur de la transaction précédente.

Impact : bug potentiel silencieux : une transaction sans libellé filtrée en milieu de boucle pourrait hériter de la catégorie de la précédente si l'ordre des gardes change. La portée étendue rend le raisonnement local impossible.

Proposition : déclarer `const` à l'intérieur du bloc de la boucle, au plus près de l'usage.

---

### [Dead Code] — Priorité : Basse

Localisation : `src/transactions-legacy.js:157–159`

Constat : la branche `else if (tx.type === 'transfer')` ne fait rien — corps vide avec un seul commentaire.

Impact : le code laisse croire que les transferts sont traités, alors qu'ils sont silencieusement ignorés dans tous les calculs (`total`, `nbCredit`, etc.).

Proposition : soit implémenter la logique réelle, soit documenter explicitement le choix de les exclure des calculs.

---

### [Long Parameter List (implicite)] — Priorité : Basse

Localisation : `src/transactions-legacy.js:31–45`

Constat : l'objet `opts` regroupe 4 paramètres distincts (`currency`, `month`, `year`, `threshold`) sans typage ni documentation, et est muté directement.

Impact : l'appelant ne sait pas quels champs sont attendus, lesquels sont obligatoires, ni quelles valeurs sont valides — tout repose sur la lecture du code source.

Proposition : documenter le contrat avec JSDoc ou TypeScript, et ne pas muter `opts` (utiliser `const options = { ...defaults, ...opts }`).

---

## Refactoring effectué

### Zone 1 — Magic Numbers → Named Constants (commit `b3bfff3`)

Les taux de change (`0.92`, `1.08`, `1.17`, `0.85`) et le seuil par défaut (`1000`) ont été extraits en deux constantes nommées en tête de fichier : `DEFAULT_THRESHOLD` et `EXCHANGE_RATES`. La chaîne `if/else if` de conversion de devise a été remplacée par un lookup `EXCHANGE_RATES[pair] ?? 1`. Complexité cognitive : **59 → 48**.

### Zone 2 — Extract Function : `categorize()` (commit `02f2857`)

Le bloc de 30 lignes de catégorisation par libellé a été extrait dans une fonction dédiée `categorize(label)` placée en tête de module. L'appel dans la boucle principale est réduit à une ligne : `category = categorize(tx.label)`. Complexité cognitive : **48 → 37**.

Les 14 tests de caractérisation passent après chaque refactoring.

---

## Éco-impact

### Score Lighthouse de départ (7 mai 2026 — localhost:4173, build preview)

| Métrique | Valeur |
|----------|--------|
| Score Performance | **82 / 100** |
| First Contentful Paint | 0,3 s |
| Largest Contentful Paint | 0,3 s |
| Total Blocking Time | 0 ms |
| Cumulative Layout Shift | 0 |
| Speed Index | 0,3 s |

**Principal avertissement** : "Réduisez les ressources JavaScript inutilisées — économies estimées : 67 Kio". La CSS est identifiée comme bloquante au rendu (1,6 Kio, 0 ms de latence réelle).

### Optimisation choisie : pagination de la liste de transactions

La liste `<ul>` dans `App.jsx` rend toutes les transactions en un seul passage DOM, sans limite. Aujourd'hui 18 entrées, mais la liste grossit à chaque ajout utilisateur et pourrait atteindre des centaines d'éléments. Une pagination simple (10 transactions par page) borne le nombre de nœuds DOM créés au chargement et à chaque mise à jour, réduit le temps de calcul du layout, et limite la quantité de données gardées en mémoire par le moteur de rendu.
