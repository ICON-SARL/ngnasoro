
import React from 'react';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { Card } from '@/components/ui/card';
import { AddSfdDialog } from '@/components/admin/sfd/AddSfdDialog';
import { useAddSfd } from '@/components/admin/hooks/sfd-management/useAddSfd';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { VoiceAssistant } from '@/components/VoiceAssistant';

const AddSfdPage = () => {
  const { isAddDialogOpen, openAddDialog, closeAddDialog } = useAddSfd();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <SuperAdminHeader />
      
      <div className="container mx-auto py-6 px-4">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Ajouter une nouvelle SFD</h1>
            <p className="text-muted-foreground">
              Créez une nouvelle institution de microfinance
            </p>
          </div>
          <div className="flex space-x-4">
            <VoiceAssistant 
              message="Pour ajouter une nouvelle SFD, cliquez sur le bouton Ajouter une SFD et remplissez le formulaire avec les informations nécessaires." 
              language="french"
            />
            <Button variant="outline" onClick={() => navigate('/sfd-management')}>
              Retour à la liste
            </Button>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <div className="text-center py-12">
            <h2 className="text-xl font-medium mb-3">Nouvelle institution de microfinance</h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Ajoutez une nouvelle SFD au système pour permettre la gestion des crédits et des comptes clients.
            </p>
            <Button onClick={openAddDialog} className="flex items-center mx-auto">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une SFD
            </Button>
          </div>
        </div>
      </div>
      
      <AddSfdDialog 
        open={isAddDialogOpen} 
        onOpenChange={closeAddDialog}
        onSuccess={() => navigate('/sfd-management')}
      />
    </div>
  );
};

export default AddSfdPage;
