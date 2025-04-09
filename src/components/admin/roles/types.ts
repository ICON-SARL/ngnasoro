
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

// Add these missing types
export interface AdminRole extends Role {
  // Add any admin-specific properties here if needed
}

export interface AdminRolePermission extends Permission {
  // Add any admin-specific permission properties here if needed
}
