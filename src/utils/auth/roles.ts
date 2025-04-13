
/**
 * Définition centralisée des rôles du système
 */

// Les rôles principaux du système
export enum UserRole {
  SUPER_ADMIN = 'admin',       // Super Admin (MEREF)
  SFD_ADMIN = 'sfd_admin',     // Administrateur SFD
  CLIENT = 'client',           // Client final
  USER = 'user'                // Utilisateur de base (avant validation)
}

// Définition des permissions disponibles dans le système
export const PERMISSIONS = {
  // Permissions Super Admin (MEREF)
  VALIDATE_SFD_FUNDS: 'validate_sfd_funds',
  AUDIT_SFD_ACCOUNTS: 'audit_sfd_accounts',
  GENERATE_REPORTS: 'generate_reports',
  MANAGE_USERS: 'manage_users',
  MANAGE_SFDS: 'manage_sfds',
  CREATE_SFD: 'create_sfd',
  AUDIT_REPORTS: 'audit_reports',
  
  // Permissions Admin SFD
  VALIDATE_CLIENT_ACCOUNTS: 'validate_client_accounts',
  CREATE_CLIENT_ACCOUNTS: 'create_client_accounts',
  MANAGE_SFD_LOANS: 'manage_sfd_loans',
  MANAGE_SFD_SAVINGS: 'manage_sfd_savings',
  VALIDATE_MOBILE_MONEY: 'validate_mobile_money',
  APPROVE_CLIENT_ADHESION: 'approve_client_adhesion',
  REJECT_CLIENT_ADHESION: 'reject_client_adhesion',
  VIEW_CLIENT_ADHESIONS: 'view_client_adhesions',
  
  // Permissions Client
  ACCESS_SAVINGS: 'access_savings',
  USE_MOBILE_MONEY: 'use_mobile_money',
  VIEW_LOAN_HISTORY: 'view_loan_history',
  REQUEST_ADHESION: 'request_adhesion',
  APPLY_FOR_LOAN: 'apply_for_loan',
  
  // Permissions communes/partagées
  MANAGE_CLIENTS: 'manage_clients',
  MANAGE_LOANS: 'manage_loans',
  VIEW_REPORTS: 'view_reports',
  EXPORT_DATA: 'export_data',
};

// Attribution des permissions par défaut pour chaque rôle
export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  // Super Admin (MEREF) a toutes les permissions
  [UserRole.SUPER_ADMIN]: [
    PERMISSIONS.VALIDATE_SFD_FUNDS,
    PERMISSIONS.AUDIT_SFD_ACCOUNTS,
    PERMISSIONS.GENERATE_REPORTS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_SFDS,
    PERMISSIONS.MANAGE_CLIENTS,
    PERMISSIONS.MANAGE_LOANS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.CREATE_SFD,
    PERMISSIONS.AUDIT_REPORTS,
  ],
  
  // Permissions Admin SFD
  [UserRole.SFD_ADMIN]: [
    PERMISSIONS.VALIDATE_CLIENT_ACCOUNTS,
    PERMISSIONS.CREATE_CLIENT_ACCOUNTS,
    PERMISSIONS.MANAGE_SFD_LOANS,
    PERMISSIONS.MANAGE_SFD_SAVINGS,
    PERMISSIONS.VALIDATE_MOBILE_MONEY,
    PERMISSIONS.MANAGE_CLIENTS,
    PERMISSIONS.MANAGE_LOANS,
    PERMISSIONS.APPROVE_CLIENT_ADHESION,
    PERMISSIONS.REJECT_CLIENT_ADHESION,
    PERMISSIONS.VIEW_CLIENT_ADHESIONS,
  ],
  
  // Permissions Client
  [UserRole.CLIENT]: [
    PERMISSIONS.ACCESS_SAVINGS,
    PERMISSIONS.USE_MOBILE_MONEY,
    PERMISSIONS.VIEW_LOAN_HISTORY,
    PERMISSIONS.REQUEST_ADHESION,
    PERMISSIONS.APPLY_FOR_LOAN,
  ],
  
  // Permissions utilisateur de base (minimal)
  [UserRole.USER]: [
    PERMISSIONS.REQUEST_ADHESION,
  ],
};

// Fonction utilitaire pour vérifier si un rôle a une permission spécifique
export function hasPermission(role: UserRole, permission: string): boolean {
  return DEFAULT_ROLE_PERMISSIONS[role]?.includes(permission) || false;
}

// Descriptions des rôles pour l'interface utilisateur
export const ROLE_DESCRIPTIONS = {
  [UserRole.SUPER_ADMIN]: "Super Administrateur (MEREF) - Gestion complète du système, des SFDs, validation des demandes de fonds et rapports.",
  [UserRole.SFD_ADMIN]: "Administrateur SFD - Gestion des comptes clients, validation des adhésions, gestion des prêts et de l'épargne.",
  [UserRole.CLIENT]: "Client - Accès aux fonctionnalités de demande d'adhésion, gestion de l'épargne, demande de prêt et remboursement.",
  [UserRole.USER]: "Utilisateur non validé - Accès limité, peut uniquement faire une demande d'adhésion."
};
