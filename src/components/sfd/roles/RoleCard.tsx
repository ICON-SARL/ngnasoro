
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Shield, User } from 'lucide-react';
import { Role, Permission } from './types';

interface RoleCardProps {
  role: Role;
  permissions: Permission[];
}

export function RoleCard({ role, permissions }: RoleCardProps) {
  return (
    <Card key={role.id}>
      <CardHeader className="pb-2">
        <div className="flex items-center mb-1">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-2 ${
            role.name === 'Gérant' 
              ? 'bg-blue-100 text-blue-700' 
              : role.name === 'Agent de Crédit'
              ? 'bg-green-100 text-green-700'
              : 'bg-amber-100 text-amber-700'
          }`}>
            {role.name === 'Gérant' 
              ? <Shield className="h-4 w-4" />
              : <User className="h-4 w-4" />
            }
          </div>
          <CardTitle>{role.name}</CardTitle>
        </div>
        <CardDescription>{role.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="text-sm font-medium">Permissions</div>
          <div className="grid grid-cols-2 gap-2">
            {role.permissions.map(permId => {
              const permission = permissions.find(p => p.id === permId);
              return permission ? (
                <div key={permId} className="flex items-center text-sm text-muted-foreground">
                  <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                  {permission.name}
                </div>
              ) : null;
            })}
          </div>
        </div>
        
        <div className="flex justify-end mt-4">
          <Button variant="outline" size="sm">Modifier</Button>
        </div>
      </CardContent>
    </Card>
  );
}
