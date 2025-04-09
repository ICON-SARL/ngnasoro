
export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  sfd_id?: string;
}

export interface NewRoleData {
  id?: string;
  name: string;
  description: string;
  permissions: string[];
}
