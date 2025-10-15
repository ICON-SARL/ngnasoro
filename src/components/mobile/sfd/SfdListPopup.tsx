
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Building, FileCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { AdhesionRequest } from '@/types/adhesionTypes';

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [adhesionRequests, setAdhesionRequests] = useState<AdhesionRequest[]>([]);

  useEffect(() => {
    const fetchActiveSfds = async () => {
      if (!isOpen) return;

      setIsLoading(true);
      setError(null);

      try {
        console.log('Fetching active SFDs for popup display');
        
        // Utiliser la fonction Edge pour récupérer les SFDs actives
        const { data, error } = await supabase.functions.invoke('fetch-sfds', {
          body: { userId: user?.id }
        });

        if (error) throw error;
        
        console.log(`Fetched ${data?.length || 0} active SFDs from Edge function`);
        
        // Vérifier si la réponse contient une erreur
        if (data && data.error) {
          throw new Error(data.error);
        }
        
        const availableSfds = Array.isArray(data) ? data : [];
        
        if (availableSfds.length === 0) {
          console.warn('No SFDs returned from Edge function');
        }
        
        const sortedSfds = sortPrioritySfds(availableSfds);
        setSfds(sortedSfds);
        
        // Fetch user's adhesion requests from client_adhesion_requests table
        if (user?.id) {
          const { data: requestsData, error: requestsError } = await supabase
            .from('client_adhesion_requests')
            .select('*')
            .eq('user_id', user.id);
            
          if (requestsError) {
            console.error('Error fetching adhesion requests:', requestsError);
          } else {
            setAdhesionRequests(requestsData as AdhesionRequest[] || []);
          }
        }
      } catch (err: any) {
        console.error('Error loading SFDs:', err);
        setError('Impossible de charger la liste des SFDs. Veuillez réessayer plus tard.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveSfds();
  }, [isOpen, user?.id]);

  const sortPrioritySfds = (sfds: Sfd[]): Sfd[] => {
    const prioritySfdNames = ["rmcr", "meref", "premier sfd"];
    
    return [...sfds].sort((a, b) => {
      const aIsPriority = prioritySfdNames.some(name => 
        a.name.toLowerCase().includes(name.toLowerCase()));
      const bIsPriority = prioritySfdNames.some(name => 
        b.name.toLowerCase().includes(name.toLowerCase()));
      
      if (aIsPriority && !bIsPriority) return -1;
      if (!aIsPriority && bIsPriority) return 1;
      
      return a.name.localeCompare(b.name);
    });
  };

  const handleSelectSfd = (sfdId: string) => {
    navigate(`/mobile-flow/sfd-adhesion/${sfdId}`);
    onClose();
  };
  
  const handleRetry = async (sfdId: string) => {
    if (!user) {
      return;
    }
    
    try {
      console.log("Handling retry for SFD:", sfdId);
      
      // Supprimer l'ancienne demande rejetée en utilisant l'RPC
      const { data, error } = await supabase.functions.invoke('handle-adhesion-retry', {
        body: { 
          userId: user.id,
          sfdId: sfdId
        }
      });
        
      if (error) {
        console.error('Erreur lors de la suppression de l\'ancienne demande:', error);
        throw error;
      }
      
      console.log('Demande rejetée supprimée avec succès');
      
      // Rediriger vers la page d'adhésion
      navigate(`/mobile-flow/sfd-adhesion/${sfdId}`);
      onClose();
    } catch (err) {
      console.error('Error handling retry:', err);
    }
  };
  
  const getSfdRequestStatus = (sfdId: string) => {
    const request = adhesionRequests.find(r => r.sfd_id === sfdId);
    return request?.status || null;
  };

  const renderButton = (sfd: Sfd) => {
    const status = getSfdRequestStatus(sfd.id);
    
    if (status === 'pending') {
      return (
        <Badge variant="outline" className="bg-amber-100 border-amber-200 text-amber-700 px-3 py-1">
          En attente
        </Badge>
      );
    } else if (status === 'rejected') {
      return (
        <Button 
          variant="destructive" 
          size="sm"
          className="bg-red-100 hover:bg-red-200 text-red-800 border-red-200"
          onClick={(e) => {
            e.stopPropagation();
            handleRetry(sfd.id);
          }}
        >
          Réessayer
        </Button>
      );
    } else {
      return (
        <Button 
          variant="default" 
          size="sm"
          className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
          onClick={(e) => {
            e.stopPropagation();
            handleSelectSfd(sfd.id);
          }}
        >
          Rejoindre
        </Button>
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
          <DialogDescription className="text-center text-gray-500">
            Sélectionnez une SFD pour faire une demande d'adhésion
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#0D6A51]" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>{error}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => navigate('/mobile-flow/sfd-selector')}
              >
                Voir tous les SFDs
              </Button>
            </div>
          ) : sfds.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-2">Aucun SFD disponible pour le moment.</p>
              <p className="text-sm text-gray-500 mb-6">
                Consultez la liste complète des SFDs pour faire une demande d'adhésion.
              </p>
              <Button 
                variant="outline" 
                className="w-full mb-4"
                onClick={() => navigate('/mobile-flow/sfd-selector')}
              >
                Voir tous les SFDs
              </Button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto py-2">
              {sfds.map((sfd) => {
                const status = getSfdRequestStatus(sfd.id);
                
                return (
                  <div 
                    key={sfd.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => status !== 'pending' && handleSelectSfd(sfd.id)}
                  >
                    <div className="flex items-center flex-1">
                      <div className="h-12 w-12 flex-shrink-0 bg-gray-100 rounded-md flex items-center justify-center mr-3 overflow-hidden">
                        {sfd.logo_url ? (
                          <img 
                            src={sfd.logo_url} 
                            alt={sfd.name} 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Building className="h-6 w-6 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-800">{sfd.name}</h3>
                          {status === 'approved' && (
                            <Badge variant="outline" className="bg-green-100 border-green-200 text-green-700 text-xs">
                              <FileCheck className="h-3 w-3 mr-1" />
                              Approuvée
                            </Badge>
                          )}
                        </div>
                        {sfd.region && (
                          <p className="text-sm text-gray-500">{sfd.region}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {renderButton(sfd)}
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-center">
          <Button
            onClick={() => navigate('/mobile-flow/sfd-selector')}
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
