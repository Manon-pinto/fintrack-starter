# Stratégie de Tests — FinTrack

## 1. C'est quoi un test unitaire ?

Un test unitaire, c'est un test qui vérifie **une seule chose à la fois** : une fonction, une méthode, une classe — prit de façon totalement isolée du reste de l'application.


**Exemple sur FinTrack :**

On teste la fonction `calculateBalance()` qui calcul le solde à partir d'une liste de transactions :

```js
// On isole la fonction et on lui donne des données 500-200
calculateBalance([
  { type: "credit", amount: 500 },
  { type: "debit",  amount: 200 }
])
// on verifie que les resultat est bien 300
```

On la teste avec plusieurs cas .
 Si elle plante sur un cas on sait ou chercher

---

## 2. C'est quoi un test d'intégration ?  Quand préférer un test d’intégration à plusieurs tests unitaires ?

Un test d'intégration vérifie que plusieurs composants fonctionnent correctement ensemble et pas juste chacun dans leur coin.

**Quand préférer un test d'intégration ?**

---

## 3. C'est quoi un test E2E ? Son principal défaut ?

Un test E2E (End-to-End) simule un vrai parcours utilisateur de bout en bout comme si quelqu'un utilisait l'application pour de vrai

Sur FinTrack, ça ressemble à :

1. Créer un compte
2. Se connecter
3. Ajouter une transaction
4. Vérifier que le bilan est mis à jour

C'est le test le plus réaliste qu'on puisse écrire

**Son principal défaut :** ils sont lents.

---

## 4. Répartition des 100 tests sur FinTrack

| Type | Nombre | Pourcentage |
|------|--------|-------------|
| Tests unitaires | **70** | 70% |
| Tests d'intégration | **20** | 20% |
| Tests E2E | **10** | 10% |

**Pourquoi cette répartition ?**

C'est ce qu'on appelle la **pyramide des tests** : on met beaucoup de tests rapides et peu de tests lents.

---