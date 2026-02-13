
# Fix: Connexion Admin impossible + Accès comptes

## Probleme identifie

Le code de connexion (`useLoginForm.ts` ligne 86) verifie le role via `app_metadata.role` :
```
const userRole = result.data?.user?.app_metadata?.role;
```

Or, pour TOUS les comptes admin, `app_metadata.role` est **null** dans la base. Les roles sont stockes correctement dans la table `user_roles`, mais le code ne la consulte jamais. Resultat : le role est toujours `undefined`, et le message "Acces refuse" s'affiche systematiquement.

## Solution

Modifier `useLoginForm.ts` pour consulter la table `user_roles` apres un login reussi, au lieu de se fier a `app_metadata.role`.

### Fichier : `src/components/auth/login/useLoginForm.ts`

**Remplacement lignes 85-113 :**

Au lieu de :
```typescript
const userRole = result.data?.user?.app_metadata?.role;
```

Faire :
```typescript
const userId = result.data.user.id;

// Chercher le role dans user_roles (source de verite)
const { data: roleData } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', userId)
  .single();

const userRole = roleData?.role || result.data?.user?.app_metadata?.role;
```

Le reste de la logique de redirection reste identique (verification `userRole === 'admin'` pour MEREF, `userRole === 'sfd_admin'` pour SFD).

## Comptes existants et identifiants

Voici les comptes deja crees dans le systeme :

| Role | Email | Mot de passe | SFD associe |
|------|-------|-------------|-------------|
| Admin MEREF | admin@meref.gov.ml | (defini lors du setup) | - |
| SFD Admin | admin.nsm@sfd.ml | (defini lors du setup) | NGNA SORO Microfinance |
| SFD Admin | admin.kj@sfd.ml | (defini lors du setup) | Kafo Jiginew |
| SFD Admin | admin.ny@sfd.ml | (defini lors du setup) | Nyesigiso |

Les mots de passe ont ete definis via la fonction `setup-admin-system`. Si vous ne vous en souvenez plus, on peut les reinitialiser via une edge function.

## Fichier modifie

| Fichier | Changement |
|---------|-----------|
| `src/components/auth/login/useLoginForm.ts` | Lecture du role depuis `user_roles` au lieu de `app_metadata` |

## Option supplementaire

Si vous souhaitez reinitialiser les mots de passe des comptes admin a une valeur connue (ex: `Admin@2024!`), je peux aussi creer une edge function de reset. Dites-le moi apres approbation.
