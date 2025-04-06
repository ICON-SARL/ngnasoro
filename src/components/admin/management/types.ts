
export enum AdminRole {
  SUPER_ADMIN = 'super-admin',
  SFD_ADMIN = 'admin-sfd',
  SUPPORT = 'support'
}

export interface AdminUser {
  id: string;
  email: string;
  role: AdminRole;
  sfd_id?: string;
  sfd_name?: string;
  is_active: boolean;
  last_login?: string;
}

export interface AdminPermissions {
  can_approve_loans: boolean;
  can_manage_sfds: boolean;
  can_view_reports: boolean;
  can_manage_admins: boolean;
}

export interface AdminFormData {
  email: string;
  password: string;
  role: AdminRole;
  sfd_id?: string;
}

export interface AdminFilterOptions {
  role?: string | AdminRole;
  sfd_id?: string;
  is_active?: boolean;
}
