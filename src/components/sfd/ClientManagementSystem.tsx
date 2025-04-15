
import React from 'react';
import ClientsManagement from './ClientsManagement';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

export const ClientManagementSystem: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestion des Clients</h1>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => navigate('/sfd-adhesion-requests')}
        >
          <UserPlus className="h-4 w-4" />
          Demandes d'adhésion
        </Button>
      </div>
      
      <ClientsManagement />
    </div>
  );
};
