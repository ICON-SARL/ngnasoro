

# Redesign de l'ecran PIN - Style Orange Money

## Objectif

Transformer l'etape de saisie du code PIN dans `UnifiedModernAuthUI` pour reproduire le design professionnel de l'ecran Orange Money montre dans la capture d'ecran : un bottom-sheet blanc avec des indicateurs ronds (dots), un clavier numerique personnalise avec touches rondes et disposition aleatoire, et un bouton "Fermer".

## Design Reference (capture d'ecran)

- **Indicateurs PIN** : 4 cercles ronds - rempli en orange quand un chiffre est saisi, gris clair sinon
- **Clavier numerique** : Grille 4x4 de boutons ronds gris clair avec chiffres melanges aleatoirement, plus backspace et delete (bouton orange)
- **Message** : Texte centre au-dessus des dots ("Veuillez saisir votre code secret")
- **Logo** : Logo de l'app centre en haut
- **Bouton Fermer** : En bas, style outline

## Fichiers a Creer/Modifier

### 1. Nouveau composant : `src/components/ui/SecurePinPad.tsx`

Clavier numerique personnalise style Orange Money :

- Grille 4 colonnes x 4 lignes de boutons circulaires
- Chiffres 0-9 melanges aleatoirement a chaque affichage (securite anti-keylogger)
- Bouton backspace (icone) et bouton clear/delete (rond orange avec icone poubelle)
- Indicateurs dots en haut : cercles remplis (couleur primaire/orange) ou vides (gris)
- Animation de remplissage des dots avec scale bounce
- Haptic feedback simulation via micro-animation sur press
- Props : `value`, `onChange`, `length`, `error`, `title`, `subtitle`

```text
Layout du clavier :
+-----+-----+-----+-----+
|  9  |  7  |  6  |  3  |
+-----+-----+-----+-----+
|  1  |  0  |  2  |  5  |
+-----+-----+-----+-----+
|  4  |  8  |  <  |  X  |  (<= backspace, X = clear orange)
+-----+-----+-----+-----+
```

Les chiffres sont melanges a chaque montage du composant pour la securite.

### 2. Modifier : `src/components/auth/UnifiedModernAuthUI.tsx`

Remplacer le composant `PinInput` par `SecurePinPad` dans les 3 etapes PIN :

- **Step `pin`** (connexion) : Titre "Veuillez saisir votre code PIN", dots orange
- **Step `setup_pin`** (creation) : Titre "Choisissez votre code PIN", dots verts
- **Step `confirm_pin`** (confirmation) : Titre "Confirmez votre code PIN", dots verts

Le bouton "Se connecter" / "Continuer" sera declenchee automatiquement quand les 4 chiffres sont saisis (auto-submit), comme Orange Money.

### 3. Style et Animations

- Dots : `w-5 h-5 rounded-full` avec transition de couleur et scale bounce
- Touches : `w-16 h-16 rounded-full bg-gray-100 text-2xl font-bold` avec `active:scale-95`
- Touche delete : fond orange (`bg-[#F5A623]`) avec icone poubelle blanche
- Touche backspace : fond gris avec icone fleche retour
- Animation d'erreur : shake horizontal des dots quand le PIN est incorrect
- Auto-submit : quand `value.length === 4`, appel automatique du handler apres 300ms

## Details Techniques

| Aspect | Implementation |
|--------|---------------|
| Securite | Chiffres melanges via `Fisher-Yates shuffle` a chaque mount |
| Auto-submit | `useEffect` detecte quand `pin.length === 4` et trigger le handler |
| Erreur shake | Animation framer-motion `x: [-10, 10, -10, 10, 0]` sur les dots |
| Accessibilite | `aria-label` sur chaque touche, role="button" |
| Performance | `useMemo` pour le shuffle, pas de re-shuffle pendant la saisie |

## Resume des Modifications

| Fichier | Action |
|---------|--------|
| `src/components/ui/SecurePinPad.tsx` | **Nouveau** - Clavier numerique securise style Orange Money |
| `src/components/auth/UnifiedModernAuthUI.tsx` | Remplacer `PinInput` par `SecurePinPad` + auto-submit |

Le composant `PinInput` existant n'est pas supprime car il pourrait etre utilise ailleurs (verification SFD, etc.).

