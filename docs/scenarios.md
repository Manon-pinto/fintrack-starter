# Scénarios BDD — Export CSV des transactions

---

## Scénario 1 : Export d'une liste vide

**Étant donné** une liste de transactions vide  
**Quand** l'utilisateur clique sur "Exporter en CSV"  
**Alors** le fichier téléchargé contient uniquement la ligne d'en-tête :  
`date,libelle,montant,categorie`

---

## Scénario 2 : Filtrage par mois en cours

**Étant donné** une liste contenant une transaction du mois en cours et une transaction du mois précédent  
**Quand** l'utilisateur clique sur "Exporter en CSV"  
**Alors** le fichier contient uniquement la transaction du mois en cours  
**Et** la transaction du mois précédent est absente du fichier

---

## Scénario 3 : Libellé contenant une virgule

**Étant donné** une transaction dont le libellé contient une virgule (ex : "Courses, supermarché")  
**Quand** l'utilisateur clique sur "Exporter en CSV"  
**Alors** le libellé est entouré de guillemets dans le fichier CSV : `"Courses, supermarché"`  
**Et** le fichier reste lisible par Excel et tout lecteur CSV conforme RFC 4180

---

## Scénario 4 : Libellé contenant des guillemets

**Étant donné** une transaction dont le libellé contient des guillemets (ex : `Achat "premium"`)  
**Quand** l'utilisateur clique sur "Exporter en CSV"  
**Alors** les guillemets internes sont doublés dans le fichier : `"Achat ""premium"""`

---

## Scénario 5 : Chaque transaction devient une ligne CSV

**Étant donné** une liste d'une transaction avec date, libellé, montant et catégorie  
**Quand** l'utilisateur clique sur "Exporter en CSV"  
**Alors** le fichier contient l'en-tête sur la première ligne  
**Et** la transaction apparaît sur la deuxième ligne au format `date,libelle,montant,categorie`
