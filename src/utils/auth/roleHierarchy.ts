
import { UserRole } from "./roleTypes";

// Définir la hiérarchie des rôles (du plus haut au plus bas niveau de permission)
const roleHierarchy: UserRole[] = [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.SFD_ADMIN,
  UserRole.SFD_STAFF,
  UserRole.CLIENT,
  UserRole.USER
];

// Vérifier si un rôle peut gérer un autre rôle (un rôle ne peut gérer que les rôles de niveau inférieur)
export function canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
  const managerIndex = roleHierarchy.indexOf(managerRole);
  const targetIndex = roleHierarchy.indexOf(targetRole);
  
  // Un rôle peut gérer un autre si son index est plus petit (plus haut niveau) dans la hiérarchie
  return managerIndex < targetIndex;
}

// Vérifier si un rôle a des permissions supérieures à un autre
export function hasHigherPermission(role1: UserRole, role2: UserRole): boolean {
  return roleHierarchy.indexOf(role1) < roleHierarchy.indexOf(role2);
}

// Obtenir la description d'un rôle
export function getRoleDescription(role: UserRole): string {
  switch (role) {
    case UserRole.SUPER_ADMIN:
      return "Administrateur de la plateforme avec accès complet";
    case UserRole.ADMIN:
      return "Administrateur MEREF avec accès à la gestion des SFDs";
    case UserRole.SFD_ADMIN:
      return "Administrateur d'une SFD avec accès à la gestion de ses clients et crédits";
    case UserRole.SFD_STAFF:
      return "Employé d'une SFD avec accès limité selon son poste";
    case UserRole.CLIENT:
      return "Client d'une SFD avec accès à son compte et ses opérations";
    case UserRole.USER:
      return "Utilisateur de base avec accès limité";
    default:
      return "Rôle inconnu";
  }
}

// Vérifier si c'est un membre du personnel d'une SFD
export function isSfdStaff(role: string | undefined): boolean {
  if (!role) return false;
  return role.includes('caissier') || 
         role.includes('agent') || 
         role.includes('credit') || 
         role.includes('manager');
}

// Vérifier les permissions spécifiques d'un membre du personnel
export function hasStaffPermission(staffRole: string, permission: string): boolean {
  // Mapping des rôles du personnel aux permissions
  const staffPermissions: Record<string, string[]> = {
    'caissier': ['transaction_view', 'transaction_create'],
    'agent_credit': ['transaction_view', 'loan_approve', 'client_view'],
    'manager': ['transaction_view', 'transaction_create', 'loan_approve', 'client_view', 'client_create']
  };
  
  // Vérifier si le rôle existe et a la permission demandée
  for (const [role, permissions] of Object.entries(staffPermissions)) {
    if (staffRole.includes(role) && permissions.includes(permission)) {
      return true;
    }
  }
  
  return false;
}
