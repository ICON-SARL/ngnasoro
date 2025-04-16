
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Building } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Loader } from '@/components/ui/loader';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface SfdListPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Sfd {
  id: string;
  name: string;
  region?: string;
  logo_url?: string;
}

const SfdListPopup: React.FC<SfdListPopupProps> = ({ isOpen, onClose }) => {
  const [sfds, setSfds] = useState<Sfd[]>([]);
  const [existingRequests, setExistingRequests] = useState<{sfd_id: string, status: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen || !user?.id) return;

      setIsLoading(true);
      setError(null);

      try {
        console.log('Fetching active SFDs for popup display');
        
        // Récupérer les SFDs via la fonction Edge
        const { data: sfdsData, error: sfdsError } = await supabase.functions.invoke('fetch-sfds', {
          body: { userId: user.id }
        });
        
        if (sfdsError) throw sfdsError;
        
        if (Array.isArray(sfdsData)) {
          console.log(`Fetched ${sfdsData.length} active SFDs from Edge function`);
          setSfds(sfdsData);
        } else {
          throw new Error('Aucune SFD active trouvée');
        }
        
        // Récupérer les demandes existantes
        const { data: existingReqs, error: requestsError } = await supabase
          .from('client_adhesion_requests')
          .select('sfd_id, status')
          .eq('user_id', user.id);
          
        if (requestsError) throw requestsError;
        
        setExistingRequests(existingReqs || []);
      } catch (err: any) {
        console.error('Erreur lors du chargement des SFDs:', err);
        setError('Impossible de charger la liste des SFDs. Veuillez réessayer plus tard.');
        toast({
          title: "Erreur de chargement",
          description: "Impossible de récupérer les SFDs disponibles",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isOpen, toast, user?.id]);

  const handleSelectSfd = (sfdId: string) => {
    // Rediriger directement vers la page de sélection SFD avec le paramètre
    navigate('/mobile-flow/sfd-adhesion/' + sfdId);
    onClose();
  };
  
  const handleRetry = async (sfdId: string) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour réessayer",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Supprimer l'ancienne demande rejetée
      const { error: deleteError } = await supabase
        .from('client_adhesion_requests')
        .delete()
        .eq('user_id', user.id)
        .eq('sfd_id', sfdId)
        .eq('status', 'rejected');
        
      if (deleteError) {
        console.error('Erreur lors de la suppression de l\'ancienne demande:', deleteError);
        throw deleteError;
      }
      
      // Rediriger vers la page d'adhésion
      navigate('/mobile-flow/sfd-adhesion/' + sfdId);
      onClose();
    } catch (err) {
      console.error('Error handling retry:', err);
      toast({
        title: "Erreur",
        description: "Impossible de traiter votre demande. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };

  const renderButton = (sfd: Sfd) => {
    const existingRequest = existingRequests.find(req => req.sfd_id === sfd.id);
    const isPending = existingRequest && ['pending', 'pending_validation'].includes(existingRequest.status);
    const isRejected = existingRequest && existingRequest.status === 'rejected';
    
    if (isPending) {
      return (
        <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-md text-sm">
          En attente
        </span>
      );
    } else if (isRejected) {
      return (
        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm cursor-pointer"
              onClick={() => handleRetry(sfd.id)}>
          Réessayer
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 bg-[#0D6A51]/10 text-[#0D6A51] rounded-md text-sm cursor-pointer"
              onClick={() => handleSelectSfd(sfd.id)}>
          Rejoindre
        </span>
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl text-[#0D6A51]">
            SFDs Partenaires MEREF
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader className="h-8 w-8 text-[#0D6A51]" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>{error}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => navigate('/sfd-selector')}
              >
                Voir tous les SFDs
              </Button>
            </div>
          ) : sfds.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucun SFD actif trouvé.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => navigate('/sfd-selector')}
              >
                Voir tous les SFDs
              </Button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto py-2">
              {sfds.map((sfd) => (
                <div 
                  key={sfd.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="h-12 w-12 flex-shrink-0 bg-gray-100 rounded-md flex items-center justify-center mr-3 overflow-hidden">
                      {sfd.logo_url ? (
                        <img 
                          src={sfd.logo_url} 
                          alt={sfd.name} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-bold text-gray-500">
                          {sfd.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{sfd.name}</h3>
                      {sfd.region && (
                        <p className="text-sm text-gray-500">{sfd.region}</p>
                      )}
                    </div>
                  </div>
                  {renderButton(sfd)}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-center">
          <Button
            onClick={() => navigate('/sfd-selector')}
            className="bg-[#0D6A51] hover:bg-[#0D6A51]/90 w-full"
          >
            <Building className="h-4 w-4 mr-2" />
            Voir tous les SFDs disponibles
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SfdListPopup;
