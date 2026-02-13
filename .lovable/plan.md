

# Reduction de la Zone Header - Logo Compact sur Fond Blanc

## Constat

La zone verte du haut (header) occupe trop d'espace vertical : le logo fait 160px dans un medaillon de 180px, le titre est en 3xl, et le padding est genereux (pt-16 pb-28). Cela pousse le formulaire trop bas sur l'ecran.

## Modifications Prevues

### `UnifiedModernAuthUI.tsx` - Zone Header Compactee

**Logo reduit dans un cercle blanc :**
- Taille logo : 160px vers 80px
- Medaillon : passer de `bg-white/10` 180px a un cercle blanc opaque `bg-white` de 96px avec `shadow-md`
- Le fond blanc fait ressortir le logo de maniere nette et professionnelle

**Typographie reduite :**
- Titre "N'GNA SORO!" : de `text-3xl` a `text-xl`
- Sous-titre "MICROFINANCE DIGITALE" : conserver en `text-xs`
- Retirer la ligne decorative (divider) pour epurer

**Espacement reduit :**
- Padding : de `pt-16 pb-28` a `pt-10 pb-20`
- Espace entre logo et titre : de `space-y-4` a `space-y-2`

**Pattern SVG :** Conserver mais simplifier (moins de cercles)

### Resultat attendu

La zone verte passe d'environ 45% de l'ecran a environ 30%, laissant plus de place au formulaire. Le logo sur fond blanc est plus lisible et professionnel.

## Fichier modifie

| Fichier | Action |
|---------|--------|
| `src/components/auth/UnifiedModernAuthUI.tsx` | Reduction header : logo 80px dans cercle blanc, typo reduite, padding reduit |

