
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useAvailableSfds } from '@/hooks/sfd/useAvailableSfds';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { Input } from '@/components/ui/input';
import { MapPin, Phone, Check, AlertCircle } from 'lucide-react';
import { AvailableSfd } from '@/components/mobile/profile/sfd-accounts/types/SfdAccountTypes';

interface DiscoverSfdsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DiscoverSfdsDialog: React.FC<DiscoverSfdsDialogProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const userId = user?.id;
  
  const [selectedSfdId, setSelectedSfdId] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [requestSent, setRequestSent] = useState<boolean>(false);

  const { 
    availableSfds,
    pendingRequests,
    isLoading,
    error,
    requestSfdAccess
  } = useAvailableSfds(userId);

  const handleSfdSelection = (sfdId: string) => {
    setSelectedSfdId(sfdId);
  };

  const handleSubmitRequest = async () => {
    if (!selectedSfdId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un SFD",
        variant: "destructive",
      });
      return;
    }

    setShowConfirmation(true);
  };

  const handleConfirmRequest = async () => {
    if (!selectedSfdId || !userId) return;

    try {
      const selectedSfd = availableSfds.find(sfd => sfd.id === selectedSfdId);
      const result = await requestSfdAccess(selectedSfdId, phoneNumber);
      
      if (result) {
        setRequestSent(true);
        toast({
          title: "Demande envoyée",
          description: `Votre demande auprès de ${selectedSfd?.name} a été envoyée avec succès.`,
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'envoi de votre demande.",
        variant: "destructive",
      });
    }
  };

  const resetAndClose = () => {
    setSelectedSfdId(null);
    setPhoneNumber('');
    setShowConfirmation(false);
    setRequestSent(false);
    onOpenChange(false);
  };

  const selectedSfd = availableSfds.find(sfd => sfd.id === selectedSfdId);

  const renderSfdCards = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-8">
          <Loader size="lg" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-6 text-center text-red-500">
          <AlertCircle className="mx-auto h-8 w-8 mb-2" />
          <p>Une erreur est survenue lors du chargement des SFDs.</p>
        </div>
      );
    }

    if (availableSfds.length === 0) {
      return (
        <div className="p-6 text-center text-gray-500">
          <p>Aucun SFD disponible pour le moment.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4 mt-4 max-h-96 overflow-y-auto pb-2 px-1">
        {availableSfds.map((sfd) => (
          <div 
            key={sfd.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
              selectedSfdId === sfd.id ? 'border-[#0D6A51] bg-[#0D6A51]/5' : 'border-gray-200'
            }`}
            onClick={() => handleSfdSelection(sfd.id)}
          >
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-lg">{sfd.name}</h4>
              {selectedSfdId === sfd.id && (
                <div className="h-6 w-6 rounded-full bg-[#0D6A51]/20 flex items-center justify-center">
                  <Check className="h-4 w-4 text-[#0D6A51]" />
                </div>
              )}
            </div>
            
            {sfd.region && (
              <div className="flex items-center text-gray-600 mt-2">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="text-sm">{sfd.region}</span>
              </div>
            )}
            
            <div className="mt-3">
              <Button 
                variant="outline" 
                size="sm" 
                className={`w-full ${
                  selectedSfdId === sfd.id ? 'border-[#0D6A51] text-[#0D6A51]' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSfdSelection(sfd.id);
                }}
              >
                Sélectionner
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderConfirmationDialog = () => {
    if (!selectedSfd) return null;

    return (
      <div className="p-4 border rounded-lg bg-gray-50 mt-4">
        <h4 className="font-medium text-center">Confirmer votre demande auprès de</h4>
        <h3 className="font-bold text-center text-lg text-[#0D6A51] mb-4">{selectedSfd.name}</h3>
        
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Numéro de téléphone (optionnel)</label>
          <Input
            type="tel"
            placeholder="Votre numéro de téléphone"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            Pour faciliter la vérification de votre identité
          </p>
        </div>
        
        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setShowConfirmation(false)}
          >
            Annuler
          </Button>
          <Button
            className="flex-1 bg-[#0D6A51] hover:bg-[#0D6A51]/90"
            onClick={handleConfirmRequest}
          >
            Confirmer
          </Button>
        </div>
      </div>
    );
  };

  const renderSuccessView = () => {
    if (!selectedSfd) return null;

    return (
      <div className="p-6 text-center">
        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Demande envoyée !
        </h3>
        <p className="text-gray-600 mb-6">
          Votre demande d'accès à <span className="font-medium">{selectedSfd.name}</span> a été envoyée avec succès. 
          Vous serez notifié lorsque votre demande aura été traitée.
        </p>
        <Button onClick={resetAndClose}>
          Fermer
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-center">
            {requestSent ? "Demande envoyée" : "Découvrir les SFDs partenaires"}
          </DialogTitle>
        </DialogHeader>
        
        {requestSent ? (
          renderSuccessView()
        ) : showConfirmation ? (
          renderConfirmationDialog()
        ) : (
          <>
            {pendingRequests.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-amber-800">
                  <span className="font-medium">Note :</span> Vous avez déjà {pendingRequests.length} demande(s) en attente d'approbation.
                </p>
              </div>
            )}
            
            {renderSfdCards()}
            
            <div className="mt-6 flex justify-end">
              <Button
                className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                disabled={!selectedSfdId}
                onClick={handleSubmitRequest}
              >
                Soumettre la demande
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DiscoverSfdsDialog;
