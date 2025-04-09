
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Edit, Trash2 } from 'lucide-react';
import { Role, Permission } from './types';

interface RoleCardProps {
  role: Role;
  permissions: Permission[];
  onEdit?: () => void;
  onDelete?: () => void;
}

export function RoleCard({ role, permissions, onEdit, onDelete }: RoleCardProps) {
  // Get permission names by ID
  const getPermissionName = (id: string) => {
    const permission = permissions.find(p => p.id === id);
    return permission ? permission.name : id;
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-primary" />
            <CardTitle>{role.name}</CardTitle>
          </div>
          <Badge variant="outline">
            {role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        <CardDescription>{role.description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-1">
          <p className="text-sm font-medium">Permissions:</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {role.permissions.slice(0, 5).map(permId => (
              <Badge key={permId} variant="secondary" className="text-xs">
                {getPermissionName(permId)}
              </Badge>
            ))}
            {role.permissions.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{role.permissions.length - 5} autres
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end gap-2">
        {onEdit && (
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-1" />
            Modifier
          </Button>
        )}
        {onDelete && (
          <Button variant="ghost" size="sm" className="text-destructive" onClick={onDelete}>
            <Trash2 className="h-4 w-4 mr-1" />
            Supprimer
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
