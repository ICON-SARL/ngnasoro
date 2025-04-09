
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
  name: string;
  description: string;
  permissions: string[];
}
