

# Plan : Verification Complete + Creation du Role "Super Hyper Admin" (Support)

## 1. Diagnostic Point par Point

### MEREF (Super Admin) - Etat Actuel
- **Dashboard** : Fonctionnel via `MerefEnhancedDashboard` avec KPIs, graphiques, et sidebar complete
- **Routes protegees** : 16 routes MEREF toutes gardees par `RoleGuard requiredRole="admin"`
- **Utilisateur existant** : `admin@meref.gov.ml` avec role `admin`
- **Sidebar** : Approbations, Gestion, Supervision, Rapports, Systeme - complet
- **Probleme detecte** : Le `RoleGuard` fait une comparaison **stricte** (`userRoleStr === requiredRoleStr`). Cela signifie qu'un `super_hyper_admin` ne pourrait PAS acceder aux routes `admin`. Il faut modifier cette logique pour supporter la hierarchie.

### SFD Admin - Etat Actuel
- **Dashboard** : Fonctionnel via `SfdAdminDashboard` avec stats, prets, adhesions, gestion caisse
- **Routes protegees** : 8 routes gardees par `RoleGuard requiredRole="sfd_admin"`
- **Utilisateurs existants** : 3 admins SFD (NSM, Kafo Jiginew, Nyesigiso)
- **Fallback SFD** : Logique de detection SFD par defaut ou premiere association disponible

### Client Mobile - Etat Actuel
- **Routes** : 30+ routes sous `/mobile-flow/` gardees par `RoleGuard requiredRole="client"`
- **Utilisateurs** : 2 clients actifs

### Probleme Central du RoleGuard
Le `RoleGuard` actuel (ligne 84) fait `userRoleStr === requiredRoleStr` - une **egalite stricte**. Un Super Hyper Admin doit pouvoir acceder a TOUTES les routes (admin, sfd_admin, client). Il faut implementer une **hierarchie de roles** dans le guard.

---

## 2. Creation du Role "Super Hyper Admin" (support_admin)

### 2.1 Migration Base de Donnees

Ajouter la valeur `support_admin` au type enum `app_role` existant :

```sql
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'support_admin';
```

Mettre a jour la fonction `has_role` pour que `support_admin` ait acces a tout (optionnel, car le RoleGuard gere cote client).

### 2.2 Modifier le Systeme de Roles TypeScript

**Fichier** : `src/hooks/auth/types.ts`
- Ajouter `SupportAdmin = 'support_admin'` dans l'enum `UserRole`

**Fichier** : `src/utils/auth/roleTypes.ts`
- Ajouter `SUPPORT_ADMIN = 'support_admin'` dans l'enum
- Ajouter les permissions du support_admin (toutes les permissions existantes + permissions support specifiques)

### 2.3 Modifier le RoleGuard - Hierarchie de Roles

**Fichier** : `src/components/RoleGuard.tsx`

Remplacer la comparaison stricte par une logique hierarchique :

```typescript
const ROLE_HIERARCHY: Record<string, number> = {
  'support_admin': 5,  // Voit TOUT
  'admin': 4,
  'sfd_admin': 3,
  'client': 2,
  'user': 1
};

// Un support_admin peut acceder a toutes les routes
const hasRole = userRolePriority >= requiredRolePriority;
```

**Exception importante** : Le `support_admin` a un comportement special - il peut acceder aux routes `admin`, `sfd_admin` ET `client` car il est support. On implementera une logique "bypass" pour ce role specifique.

### 2.4 Modifier AuthContext - Ajout du role dans la hierarchie

**Fichier** : `src/hooks/auth/AuthContext.tsx`

Ajouter `support_admin` dans `ROLE_HIERARCHY` avec priorite 5 et dans la redirection `Index.tsx`.

### 2.5 Modifier Index.tsx - Redirection du Support Admin

Ajouter un case pour `support_admin` qui redirige vers le dashboard support :

```typescript
case 'support_admin':
  navigate('/support-admin-dashboard', { replace: true });
  break;
```

---

## 3. Dashboard Support Admin (Nouveau)

### 3.1 Page principale : `src/pages/SupportAdminDashboard.tsx`

Un dashboard unifie avec vue 360 degres :

- **Section MEREF** : Acces rapide au dashboard admin, bouton "Voir comme MEREF"
- **Section SFDs** : Liste de toutes les SFDs avec acces direct a chaque dashboard
- **Section Clients** : Recherche client globale (par nom, email, telephone)
- **Section Logs** : Derniers audit_logs en temps reel
- **Section Support** : Tickets de support, diagnostics systeme
- **KPIs globaux** : Total utilisateurs, SFDs, prets, transactions du jour

### 3.2 Layout Support : `src/components/support/SupportAdminLayout.tsx`

Sidebar dediee avec :
- Dashboard global
- Vue MEREF (lien direct vers `/super-admin-dashboard`)
- Vue SFDs (liste toutes les SFDs avec navigation)
- Recherche utilisateurs
- Logs en temps reel
- Diagnostics systeme
- Configuration

### 3.3 Composants Support Specifiques

- `SupportUserSearch.tsx` : Recherche multi-criteres (email, phone, nom) avec resultats detailles
- `SupportSystemHealth.tsx` : Monitoring temps reel (nombre connexions, erreurs recentes, latence)
- `SupportQuickActions.tsx` : Actions rapides (reset password, debloquer compte, forcer role)

---

## 4. Routes Support Admin

**Fichier** : `src/routes.tsx`

Ajouter les routes support :

```typescript
// Support Admin routes
{
  path: '/support-admin-dashboard',
  element: <RoleGuard requiredRole="support_admin"><SupportAdminLayout /></RoleGuard>,
  children: [
    { index: true, element: <SupportAdminDashboard /> },
    { path: 'users', element: <SupportUsersPage /> },
    { path: 'system', element: <SupportSystemPage /> },
    { path: 'logs', element: <SupportLogsPage /> },
  ]
}
```

**Modification cle du RoleGuard** : Le `support_admin` pourra aussi acceder aux routes `admin` et `sfd_admin` grace a la hierarchie.

---

## 5. Resume des Fichiers a Creer/Modifier

| Fichier | Action |
|---------|--------|
| Migration SQL | Ajouter `support_admin` au type `app_role` |
| `src/hooks/auth/types.ts` | Ajouter `SupportAdmin` dans enum |
| `src/utils/auth/roleTypes.ts` | Ajouter role + permissions |
| `src/components/RoleGuard.tsx` | Implementer hierarchie de roles |
| `src/hooks/auth/AuthContext.tsx` | Ajouter support_admin dans hierarchie |
| `src/pages/Index.tsx` | Ajouter redirection support_admin |
| `src/pages/SupportAdminDashboard.tsx` | **Nouveau** - Dashboard principal |
| `src/components/support/SupportAdminLayout.tsx` | **Nouveau** - Layout avec sidebar |
| `src/components/support/SupportAdminSidebar.tsx` | **Nouveau** - Navigation |
| `src/components/support/SupportUserSearch.tsx` | **Nouveau** - Recherche utilisateurs |
| `src/components/support/SupportSystemHealth.tsx` | **Nouveau** - Monitoring systeme |
| `src/routes.tsx` | Ajouter routes support |

### Securite
- Le `support_admin` a acces a tout mais ses actions sont **toutes loguees** dans `audit_logs` avec severite `info`
- Les politiques RLS existantes utilisant `has_role(uid, 'admin')` devront aussi autoriser `support_admin` via une mise a jour de la migration

