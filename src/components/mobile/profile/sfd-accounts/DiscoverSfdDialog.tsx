
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAvailableSfds } from '@/hooks/sfd/useAvailableSfds';
import { AvailableSfd } from './types/SfdAccountTypes';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, MapPin, Phone, CheckCircle2 } from 'lucide-react';
import { Loader } from '@/components/ui/loader';

interface DiscoverSfdDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestSent?: () => void;
}

const DiscoverSfdDialog: React.FC<DiscoverSfdDialogProps> = ({ 
  isOpen, 
  onOpenChange,
  onRequestSent
}) => {
  const { user } = useAuth();
  const { 
    availableSfds, 
    pendingRequests,
    isLoading, 
    requestSfdAccess 
  } = useAvailableSfds(user?.id);
  
  const [selectedSfd, setSelectedSfd] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmSfd, setConfirmSfd] = useState<AvailableSfd | null>(null);

  const handleSelectSfd = (sfd: AvailableSfd) => {
    setSelectedSfd(sfd.id);
    setConfirmSfd(sfd);
  };

  const handleRequestAccess = async () => {
    if (!selectedSfd) return;
    
    setSubmitting(true);
    try {
      const success = await requestSfdAccess(selectedSfd);
      if (success) {
        setSelectedSfd(null);
        setConfirmSfd(null);
        if (onRequestSent) {
          onRequestSent();
        }
        onOpenChange(false);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setConfirmSfd(null);
  };
  
  // Check if an SFD has a pending request
  const hasPendingRequest = (sfdId: string) => {
    return pendingRequests.some(req => req.sfd_id === sfdId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <DialogHeader className="bg-[#0D6A51] text-white p-4">
          <DialogTitle className="text-xl font-semibold">
            Découvrir les SFDs
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          {confirmSfd ? (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800">Confirmer votre demande</h3>
                <p className="text-gray-600 mb-4">
                  Voulez-vous soumettre une demande de compte auprès de <strong>{confirmSfd.name}</strong>?
                </p>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={submitting}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleRequestAccess}
                    disabled={submitting}
                    className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                  >
                    {submitting ? <Loader size="sm" className="mr-2" /> : null}
                    Confirmer la demande
                  </Button>
                </div>
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader size="lg" className="mb-4" />
              <p className="text-gray-500">Chargement des SFDs disponibles...</p>
            </div>
          ) : availableSfds.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <h3 className="text-lg font-medium">Aucun SFD disponible</h3>
              <p className="text-gray-500 mt-2">
                Il n'y a actuellement aucun SFD disponible pour une nouvelle connexion.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableSfds.map((sfd) => {
                const isPending = hasPendingRequest(sfd.id);
                return (
                  <div 
                    key={sfd.id} 
                    className={`border rounded-lg p-4 ${
                      selectedSfd === sfd.id ? 'border-[#0D6A51] bg-[#0D6A51]/5' : 'border-gray-200'
                    } hover:border-[#0D6A51] transition-colors cursor-pointer`}
                    onClick={() => !isPending && handleSelectSfd(sfd)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-800">{sfd.name}</h3>
                        {sfd.region && (
                          <div className="flex items-center text-gray-600 mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span className="text-sm">{sfd.region}</span>
                          </div>
                        )}
                      </div>
                      {isPending ? (
                        <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                          Demande en cours
                        </span>
                      ) : selectedSfd === sfd.id ? (
                        <CheckCircle2 className="h-5 w-5 text-[#0D6A51]" />
                      ) : null}
                    </div>
                    
                    <div className="mt-3 flex justify-end">
                      {isPending ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          disabled 
                          className="text-xs"
                        >
                          En attente de validation
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleSelectSfd(sfd)}
                          size="sm"
                          variant={selectedSfd === sfd.id ? "default" : "outline"}
                          className={selectedSfd === sfd.id ? "bg-[#0D6A51] hover:bg-[#0D6A51]/90" : ""}
                        >
                          Sélectionner
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {selectedSfd && (
                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={handleRequestAccess}
                    className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                  >
                    Soumettre la demande
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DiscoverSfdDialog;
