
import { Role, Permission } from './types';

export interface NewRoleFormData {
  name: string;
  description: string;
  permissions: string[];
}

export interface RoleManagerState {
  roles: Role[];
  showNewRoleDialog: boolean;
  isEditMode: boolean;
  editRoleId: string | null;
  newRole: NewRoleFormData;
}

export interface RoleManagerActions {
  setNewRole: (role: Partial<NewRoleFormData>) => void;
  setShowNewRoleDialog: (show: boolean) => void;
  handleTogglePermission: (permissionId: string) => void;
  handleSaveNewRole: () => void;
  handleEditRole?: (role: Role) => void;
  handleDeleteRole?: (roleId: string) => void;
  setIsEditMode?: (isEdit: boolean) => void;
}

export interface RoleManagerResult extends RoleManagerState, RoleManagerActions {
  permissions: Permission[];
}
