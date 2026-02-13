
# Fix: Page "Acces Refuse" apres creation de compte

## Probleme

Apres inscription, l'utilisateur a le role `user` (pas encore `client`). Le systeme le redirige vers `/mobile-flow/adhesion-status` pour suivre sa demande d'adhesion. Mais la route `/mobile-flow/*` est protegee par un `RoleGuard` qui exige le role `client` (ligne 271 de `routes.tsx`). Resultat : "Acces Refuse".

Il existe deja une route `/adhesion-status` (ligne 135) qui n'est PAS protegee par ce guard et qui est accessible aux utilisateurs avec le role `user`.

## Solution

Deux corrections simples :

### 1. `src/pages/mobile/SfdSelectionPage.tsx`

Remplacer les navigations vers `/mobile-flow/adhesion-status` par `/adhesion-status` :

- Ligne 163 : `navigate('/mobile-flow/adhesion-status')` devient `navigate('/adhesion-status')`
- Ligne 441 : `navigate('/mobile-flow/adhesion-status')` devient `navigate('/adhesion-status')`

### 2. `src/routes.tsx`

Supprimer la route dupliquee `adhesion-status` a l'interieur du bloc `/mobile-flow` (ligne 293) car elle est inaccessible aux utilisateurs `user` et cree de la confusion. La route standalone `/adhesion-status` (ligne 135) suffit.

## Fichiers modifies

| Fichier | Changement |
|---------|-----------|
| `SfdSelectionPage.tsx` | Rediriger vers `/adhesion-status` au lieu de `/mobile-flow/adhesion-status` |
| `routes.tsx` | Supprimer la route dupliquee dans le bloc mobile-flow |

## Resultat attendu

Apres inscription et soumission d'une demande d'adhesion, l'utilisateur est redirige vers `/adhesion-status` (accessible avec le role `user`) au lieu de recevoir "Acces Refuse".
