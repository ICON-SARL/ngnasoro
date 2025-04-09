
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
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
    <ScrollArea className="h-[200px] border rounded-md p-2">
      <div className="space-y-2">
        {permissions.map((permission) => (
          <div key={permission.id} className="flex items-start space-x-2 p-1">
            <Checkbox 
              id={`permission-${permission.id}`}
              checked={selectedPermissions.includes(permission.id)}
              onCheckedChange={() => onTogglePermission(permission.id)}
            />
            <div>
              <label 
                htmlFor={`permission-${permission.id}`}
                className="text-sm font-medium cursor-pointer"
              >
                {permission.name}
              </label>
              <p className="text-xs text-muted-foreground">
                {permission.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
