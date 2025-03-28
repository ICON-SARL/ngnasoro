
import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings, Plus } from 'lucide-react';

interface UserManagementHeaderProps {
  title: string;
  description: string;
}

export const UserManagementHeader = ({ title, description }: UserManagementHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-1" />
          Rôles & Permissions
        </Button>
        <Button>
          <Plus className="h-4 w-4 mr-1" />
          Ajouter Utilisateur
        </Button>
      </div>
    </div>
  );
};
