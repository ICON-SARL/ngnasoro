
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Edit, Trash2 } from 'lucide-react';
import { AdminRole, AdminRolePermission } from './types';

interface RoleCardProps {
  role: AdminRole;
  permissions: AdminRolePermission[];
  onEdit?: (role: AdminRole) => void;
  onDelete?: (roleId: string) => void;
}

export function RoleCard({ role, permissions, onEdit, onDelete }: RoleCardProps) {
  // Map permission IDs to their display names
  const permissionMap = permissions.reduce((acc, perm) => {
    acc[perm.id] = perm.name;
    return acc;
  }, {} as Record<string, string>);
  
  return (
    <Card className="border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-100 text-blue-700 p-1.5 rounded-full">
              <Shield className="h-4 w-4" />
            </div>
            <CardTitle className="text-lg">{role.name}</CardTitle>
          </div>
          {(onEdit || onDelete) && (
            <div className="flex items-center gap-1">
              {onEdit && (
                <Button variant="ghost" size="sm" onClick={() => onEdit(role)}>
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button variant="ghost" size="sm" onClick={() => onDelete(role.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
        <CardDescription>
          {role.description || 'Aucune description disponible'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Permissions:</h4>
          <div className="flex flex-wrap gap-1">
            {role.permissions && role.permissions.length > 0 ? (
              role.permissions.map((permId) => (
                <Badge key={permId} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {permissionMap[permId] || permId}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">Aucune permission</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
