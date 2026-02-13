

# Amelioration du LoadingScreen - Logo plus grand et design moderne

## Probleme

Le composant `LoadingScreen.tsx` (affiche sur `/sfd-selection` et d'autres pages pendant le chargement) utilise encore l'ancien design :
- Logo petit (56px) dans un medaillon blanc avec `rounded-full` et `shadow-md`
- Trois points animes comme indicateur de chargement
- Le logo est coupe et peu visible

## Solution

Mettre a jour `LoadingScreen.tsx` pour correspondre au nouveau style du SplashScreen :

### Fichier : `src/components/ui/LoadingScreen.tsx`

1. Remplacer l'import du logo local par le fichier transparent : `/lovable-uploads/LOGO_transprant_1763143001713.png`
2. Supprimer le medaillon (`rounded-full bg-white shadow-md`)
3. Agrandir le logo a **100px** (`w-[100px] h-[100px] object-contain`) - affichage direct sans fond
4. Remplacer les 3 dots par une barre de progression fine animee (coherent avec le splash)
5. Conserver le texte "CHARGEMENT..." en dessous

### Structure visuelle

```text
+---------------------------+
|                           |
|                           |
|       [LOGO 100px]        |
|     (sans medaillon)      |
|                           |
|    ==== barre fine ====   |
|       CHARGEMENT...       |
|                           |
+---------------------------+
```

### Detail des changements

- Supprimer `import logoNgnaSoro from '@/assets/ngna-soro-logo.png'`
- Logo : `<img src="/lovable-uploads/LOGO_transprant_1763143001713.png" className="w-[100px] h-[100px] object-contain" />`
- Barre de progression : div de 2px de hauteur, largeur 120px, animation infinie de gauche a droite
- Texte : conserver le style existant (`text-xs uppercase tracking-wide`)

## Fichier modifie

| Fichier | Changement |
|---------|-----------|
| `src/components/ui/LoadingScreen.tsx` | Logo transparent 100px sans medaillon, barre de progression, suppression des 3 dots |

