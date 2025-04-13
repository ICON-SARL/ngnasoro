
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ClientAdhesionForm } from '@/components/client/ClientAdhesionForm';
import { AvailableSfd } from '@/components/mobile/profile/sfd-accounts/types/SfdAccountTypes';

interface ClientAdhesionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSfd: AvailableSfd | null;
}

const ClientAdhesionDialog: React.FC<ClientAdhesionDialogProps> = ({
  isOpen,
  onClose,
  selectedSfd
}) => {
  if (!selectedSfd) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Demande d'adhésion à {selectedSfd.name}</DialogTitle>
        </DialogHeader>
        
        <ClientAdhesionForm 
          sfdId={selectedSfd.id}
          sfdName={selectedSfd.name}
          onSuccess={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ClientAdhesionDialog;
