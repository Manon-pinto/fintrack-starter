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

### [Long Method] — Priorité : Haute

Localisation : `src/transactions-legacy.js:15`

Constat : `processTransactions` fait 194 lignes et mélange 7 responsabilités dans un seul bloc séquentiel : normalisation des options, filtrage par date, validation, conversion de devises, catégorisation, calculs, tri.

Impact : impossible à tester unitairement par étape, toute modification risque de casser un effet de bord ailleurs dans la même fonction.

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

### [Unclear Naming] — Priorité : Moyenne

Localisation : `src/transactions-legacy.js:24–27`

Constat : les variables `i`, `j`, `tx`, `rate`, `converted`, `category` sont déclarées en haut de fonction avec `var`-style et réutilisées dans toute la boucle, à la manière du C des années 90.

Impact : dans un bloc de 200 lignes, `rate` ou `converted` peuvent signifier des choses différentes selon le contexte ; la portée étendue rend le débogage difficile.

Proposition : déclarer chaque variable au plus près de son utilisation avec `const` ou `let`, avec des noms explicites (`exchangeRate`, `convertedAmount`).

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
