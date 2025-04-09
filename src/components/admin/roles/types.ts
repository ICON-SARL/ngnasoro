
import { UserRole } from '@/utils/auth/roleTypes';

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
  category?: string;
}

export interface NewRoleData {
  name: string;
  description: string;
  permissions: string[];
}
