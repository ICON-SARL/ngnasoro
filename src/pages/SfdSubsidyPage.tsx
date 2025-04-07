
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SfdAdminDashboard } from '@/components/admin/SfdAdminDashboard';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/auth';
import { usePermissions } from '@/hooks/auth/usePermissions';
import CreateSubsidyRequestForm from '@/components/sfd/subsidies/CreateSubsidyRequestForm';
import SubsidyRequestsList from '@/components/sfd/subsidies/SubsidyRequestsList';
import SubsidyRequestDetails from '@/components/sfd/subsidies/SubsidyRequestDetails';

const SfdSubsidyPage = () => {
  const { user } = useAuth();
  const { isSfdAdmin } = usePermissions();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  
  // Mock SFD ID for demo purposes - in a real application, this would come from the user's profile
  const sfdId = user?.id || '';
  
  const handleOpenCreateDialog = () => {
    setIsCreateDialogOpen(true);
  };
  
  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
  };
  
  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
  };
  
  const handleViewDetails = (requestId: string) => {
    setSelectedRequestId(requestId);
  };
  
  const handleBackToList = () => {
    setSelectedRequestId(null);
  };
  
  if (!isSfdAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center p-6">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Accès non autorisé</h2>
          <p className="text-gray-600">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SfdAdminDashboard />
      
      <div className="container mx-auto p-4 md:p-6 mt-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">Prêts MEREF</h2>
            <p className="text-sm text-muted-foreground">
              Demandez des prêts à taux réduit auprès du MEREF pour financer vos activités
            </p>
          </div>
          
          {!selectedRequestId && (
            <Button onClick={handleOpenCreateDialog}>
              <Plus className="h-4 w-4 mr-1" />
              Nouvelle demande
            </Button>
          )}
        </div>
        
        {selectedRequestId ? (
          <SubsidyRequestDetails 
            requestId={selectedRequestId}
            onBack={handleBackToList}
          />
        ) : (
          <SubsidyRequestsList 
            sfdId={sfdId}
            onViewDetails={handleViewDetails}
          />
        )}
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nouvelle demande de prêt MEREF</DialogTitle>
            </DialogHeader>
            <CreateSubsidyRequestForm
              onSuccess={handleCreateSuccess}
              onCancel={handleCloseCreateDialog}
              sfdId={sfdId}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SfdSubsidyPage;
