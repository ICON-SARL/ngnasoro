
export interface AdminRolePermission {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export interface AdminRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface NewRoleData {
  id?: string;
  name: string;
  description: string;
  permissions: string[];
}

// Add the types that were referenced but not defined
export type Role = AdminRole;
export type Permission = AdminRolePermission;
