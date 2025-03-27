
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Permission } from './types';

interface PermissionListProps {
  permissions: Permission[];
  selectedPermissions: string[];
  onTogglePermission: (permissionId: string) => void;
}

export function PermissionList({ 
  permissions, 
  selectedPermissions, 
  onTogglePermission 
}: PermissionListProps) {
  return (
    <div className="border rounded-md p-3 space-y-3">
      {permissions.map(permission => (
        <div key={permission.id} className="flex items-center justify-between">
          <div>
            <div className="font-medium">{permission.name}</div>
            <div className="text-sm text-muted-foreground">{permission.description}</div>
          </div>
          <Switch 
            checked={selectedPermissions?.includes(permission.id) || false}
            onCheckedChange={() => onTogglePermission(permission.id)}
          />
        </div>
      ))}
    </div>
  );
}
