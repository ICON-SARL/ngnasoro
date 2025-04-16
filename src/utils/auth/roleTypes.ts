
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  SFD_ADMIN = 'sfd_admin',
  CLIENT = 'client',
  USER = 'user'
}

// Use string for compatibility with existing code
export const SUPER_ADMIN = 'admin';
export const SFD_ADMIN = 'sfd_admin';
export const CLIENT = 'client';

// Permission constants
export const PERMISSIONS = {
  CREATE_SFD: 'create_sfd',
  EDIT_SFD: 'edit_sfd',
  DELETE_SFD: 'delete_sfd',
  VIEW_SFD: 'view_sfd',
  CREATE_SFD_ADMIN: 'create_sfd_admin',
  EDIT_SFD_ADMIN: 'edit_sfd_admin',
  DELETE_SFD_ADMIN: 'delete_sfd_admin',
  VIEW_SFD_ADMIN: 'view_sfd_admin',
  APPROVE_SUBSIDY: 'approve_subsidy',
  REJECT_SUBSIDY: 'reject_subsidy',
  AUDIT_REPORTS: 'audit_reports',
};
