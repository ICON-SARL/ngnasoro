
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UserPlus, RefreshCw, Search, AlertCircle } from 'lucide-react';
import { ClientManagement } from '@/components/sfd/ClientManagement';
import NewClientModal from './client-management/NewClientModal';

export const ClientManagementSystem: React.FC = () => {
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gestion des Clients</h1>
          <p className="text-muted-foreground">
            Ajoutez, modifiez et gérez les clients de votre SFD
          </p>
        </div>
        
        <Button 
          onClick={() => setIsNewClientModalOpen(true)}
          className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Ajouter un Client
        </Button>
      </div>
      
      <ClientManagement />
      
      <NewClientModal
        isOpen={isNewClientModalOpen}
        onClose={() => setIsNewClientModalOpen(false)}
        onClientCreated={() => {
          // Handle client creation success
        }}
      />
    </div>
  );
};
