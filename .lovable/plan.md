

# Amelioration du Splash Screen - Design Moderne et Pro

## Probleme actuel

- Le logo est petit (64px dans un cercle de 96px) et coupe par `rounded-full`
- Le medaillon blanc avec ombre cache les details du logo
- L'ensemble manque d'impact visuel pour un ecran d'accueil fintech

## Solution

Refonte du `SplashScreen.tsx` avec un design epure, moderne et professionnel :

### Design propose

- **Fond** : Blanc pur (conserve)
- **Logo** : Utiliser le logo transparent (`LOGO_transprant_1763143001713.png`) en grande taille (120px), SANS medaillon, SANS rounded-full, SANS shadow -- le logo s'affiche directement sur fond blanc pour une lisibilite maximale
- **Titre** : "N'GNA SORO!" en vert marque (#0D6A51), police plus grande (text-3xl), espacement elegant
- **Sous-titre** : "Votre partenaire financier" avec apparition progressive
- **Indicateur de chargement** : Barre de progression fine et animee en bas (plus pro que les 3 points)
- **Animations** : 
  - Logo : fade-in + leger scale-up avec easing premium
  - Titre : slide-up fluide
  - Barre : progression horizontale animee

### Structure visuelle

```text
+---------------------------+
|                           |
|                           |
|                           |
|         [LOGO 120px]      |
|      (sans fond, direct)  |
|                           |
|       N'GNA SORO!         |
|  Votre partenaire financier|
|                           |
|                           |
|                           |
|    ====== barre ======    |
+---------------------------+
```

## Detail technique

### Fichier : `src/components/mobile/SplashScreen.tsx`

1. Remplacer l'import du logo par le fichier transparent :
   - `import logo from '@/assets/ngna-soro-logo.png'` devient une reference a `/lovable-uploads/LOGO_transprant_1763143001713.png`
2. Supprimer le conteneur medaillon (div avec `rounded-full bg-white shadow-md`)
3. Afficher l'image directement : `w-[120px] h-[120px] object-contain` sans arrondi
4. Augmenter la taille du titre a `text-3xl font-bold`
5. Remplacer les 3 dots par une barre de progression fine animee (hauteur 2px, largeur ~60%, animation de gauche a droite)
6. Ajuster le timing des animations pour un enchainement fluide

### Fichier modifie

| Fichier | Changement |
|---------|-----------|
| `src/components/mobile/SplashScreen.tsx` | Logo transparent grande taille, suppression medaillon, barre de progression, animations premium |

