
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface NewRoleData {
  id?: string;
  name: string;
  description?: string;
  permissions: string[];
}

export interface StaffRole {
  id: string;
  name: string;
  code: string;
  description: string;
  permissions: string[];
}
