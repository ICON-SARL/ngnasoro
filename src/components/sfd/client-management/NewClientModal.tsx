
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from '@/components/ui/dialog';
import { NewClientForm } from '@/components/sfd/NewClientForm';

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientCreated: () => void;
}

const NewClientModal: React.FC<NewClientModalProps> = ({ 
  isOpen, 
  onClose, 
  onClientCreated 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau client</DialogTitle>
          <DialogDescription>
            Remplissez ce formulaire pour créer un nouveau client SFD.
          </DialogDescription>
        </DialogHeader>
        
        <NewClientForm onSuccess={() => {
          onClientCreated();
          onClose();
        }} />
      </DialogContent>
    </Dialog>
  );
};

export default NewClientModal;
