
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, UserCog } from 'lucide-react';

export interface RoleItem {
  name: string;
  description: string;
  userCount: number;
  permissions: string[];
}

interface RolesListProps {
  roles: RoleItem[];
}

export const RolesList = ({ roles }: RolesListProps) => {
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Rôles & Permissions</h3>
      <div className="border rounded-lg overflow-hidden bg-white">
        <div className="divide-y">
          {roles.map((role, index) => (
            <div key={index} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-2 ${
                    role.name === 'Administrateur' 
                      ? 'bg-purple-100 text-purple-700' 
                      : role.name === 'Superviseur'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {role.name === 'Administrateur' 
                      ? <Shield className="h-4 w-4" />
                      : <UserCog className="h-4 w-4" />
                    }
                  </div>
                  <h4 className="font-medium">{role.name}</h4>
                </div>
                <Badge variant="outline">
                  {role.userCount} utilisateur{role.userCount > 1 ? 's' : ''}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{role.description}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {role.permissions.map((perm, i) => (
                  <Badge key={i} variant="outline" className="bg-gray-50">
                    {perm}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
