

# Amelioration SFD Partners Page + Splash Screen

## 1. `src/pages/SfdListPage.tsx` - Responsive et fonctionnel

D'apres la capture d'ecran, la page fonctionne mais presente des problemes de layout mobile :
- Les cartes SFD debordent horizontalement (texte coupe)
- La barre de recherche et les filtres region manquent d'espacement mobile
- Le bouton "Choisir cette SFD" devrait passer l'ID du SFD selectionne (pas juste naviguer vers /sfd-selection)

**Corrections :**
- Search bar : retirer `backdrop-blur-xl`, utiliser `bg-gray-50 rounded-2xl h-12` (coherent avec le design system)
- Filtres region : ajouter `snap-x snap-mandatory` pour un scroll horizontal fluide, masquer la scrollbar, ajouter un gradient fade sur les bords
- Cards SFD : `rounded-2xl bg-white shadow-sm border border-gray-100` au lieu de `bg-card/80 backdrop-blur-sm` - plus epure
- Logo SFD : `rounded-xl` au lieu de `rounded-2xl`, fond `bg-gray-50`
- Bouton CTA : `bg-[#0D6A51] text-white rounded-xl` plein au lieu de `variant="outline"`, passer `sfd.id` dans le state de navigation
- Services badges : `bg-gray-100 text-gray-700 rounded-lg` plus sobre
- Section "Votre SFD n'est pas listee" : reduire padding, style plus compact
- Grid responsive : `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` pour une meilleure adaptation mobile
- Retirer les animations motion excessives pour la performance mobile

## 2. `src/components/mobile/SplashScreen.tsx` - Fond blanc moderne

Le splash screen est actuellement sur fond vert avec des effets lourds (particles, rings, backdrop-blur). On le simplifie radicalement :

- Fond : `bg-white` pur au lieu du gradient vert
- Logo : dans un cercle blanc avec ombre douce (`shadow-md`), taille reduite a `w-20 h-20`
- Retirer completement les particles flottantes (6 divs animees inutiles)
- Retirer les rings animes (3 cercles concentriques)
- Retirer le `backdrop-blur-xl` du conteneur logo
- Titre : `text-[#0D6A51]` au lieu de `text-white`
- Sous-titre : `text-gray-500` au lieu de `text-white/70`
- Dots de chargement : `bg-[#0D6A51]` au lieu de `bg-white/50`
- Look minimaliste : logo + nom + dots, rien d'autre

## 3. `src/components/ui/LoadingScreen.tsx` - Coherence fond blanc

- Meme traitement que le splash : fond `bg-white` au lieu du gradient vert
- Logo dans un cercle avec ombre douce
- Dots en vert brand `bg-[#0D6A51]`
- Texte en `text-gray-500`

## Fichiers modifies

| Fichier | Changement |
|---------|-----------|
| `SfdListPage.tsx` | Responsive cards, search epure, navigation fonctionnelle avec SFD ID, scroll region fluide |
| `SplashScreen.tsx` | Fond blanc, logo sur fond blanc, retrait effets lourds |
| `LoadingScreen.tsx` | Fond blanc coherent, dots verts |

