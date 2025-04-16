
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SfdProps {
  id: string;
  name: string;
  code?: string;
  region?: string;
  logo_url?: string | null;
}

interface SfdListProps {
  sfds: SfdProps[];
  existingRequests?: Array<{sfd_id: string, status: string}>;
  isSubmitting?: boolean;
  onSelectSfd?: (sfdId: string) => void;
  onRetry?: (sfdId: string) => void;
}

const SfdList: React.FC<SfdListProps> = ({ 
  sfds, 
  existingRequests = [], 
  isSubmitting = false,
  onSelectSfd,
  onRetry
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Fonction pour gérer le clic sur le bouton Réessayer
  const handleRetryClick = async (sfd: SfdProps, e: React.MouseEvent) => {
    e.stopPropagation(); // Empêcher la propagation du clic
    
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour soumettre une demande",
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.log(`Réessayer pour SFD: ${sfd.id}`);
      
      // Si une fonction de rappel pour réessayer est fournie, l'utiliser
      if (onRetry) {
        onRetry(sfd.id);
      } else {
        // Supprimer l'ancienne demande rejetée
        const { error: deleteError } = await supabase
          .from('client_adhesion_requests')
          .delete()
          .eq('user_id', user.id)
          .eq('sfd_id', sfd.id)
          .eq('status', 'rejected');
          
        if (deleteError) {
          console.error('Erreur lors de la suppression de l\'ancienne demande:', deleteError);
          throw deleteError;
        }
        
        // Rediriger vers la page d'adhésion pour créer une nouvelle demande
        navigate(`/mobile-flow/sfd-adhesion/${sfd.id}`);
      }
    } catch (error) {
      console.error('Error handling retry:', error);
      toast({
        title: "Erreur",
        description: "Impossible de traiter votre demande. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };

  // Fonction pour gérer le clic sur le bouton Rejoindre
  const handleJoinClick = async (sfd: SfdProps, e: React.MouseEvent) => {
    e.stopPropagation(); // Empêcher la propagation du clic
    
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour rejoindre une SFD",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Vérifier si l'utilisateur a déjà une demande en cours pour cette SFD
      const isPending = existingRequests.some(req => 
        req.sfd_id === sfd.id && ['pending', 'pending_validation'].includes(req.status)
      );
      
      if (isPending) {
        toast({
          title: "Demande en cours",
          description: "Vous avez déjà une demande en attente pour cette SFD",
        });
        return;
      }
      
      console.log(`Clicking on SFD: ${sfd.id}, isPending: ${isPending}`);
      
      if (onSelectSfd) {
        onSelectSfd(sfd.id);
      } else {
        // Si aucun gestionnaire externe n'est fourni, naviguer directement vers la page d'adhésion
        navigate(`/mobile-flow/sfd-adhesion/${sfd.id}`);
      }
    } catch (error) {
      console.error('Error handling SFD selection:', error);
      toast({
        title: "Erreur",
        description: "Impossible de traiter votre demande",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-3">
      {sfds.length === 0 ? (
        <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-gray-500">Aucune SFD disponible actuellement.</p>
        </div>
      ) : (
        sfds.map(sfd => {
          // Vérifier si l'utilisateur a déjà une demande pour cette SFD
          const existingRequest = existingRequests.find(req => req.sfd_id === sfd.id);
          const isPending = existingRequest && ['pending', 'pending_validation'].includes(existingRequest.status);
          const isRejected = existingRequest && existingRequest.status === 'rejected';
          
          return (
            <Card key={sfd.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-3 overflow-hidden">
                      {sfd.logo_url ? (
                        <img 
                          src={sfd.logo_url} 
                          alt={sfd.name} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Building className="h-6 w-6 text-blue-500" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{sfd.name}</h3>
                      <p className="text-sm text-gray-500">
                        {sfd.region || (sfd.code ? `Code: ${sfd.code}` : '')}
                      </p>
                    </div>
                  </div>
                  
                  {isPending ? (
                    <Button
                      className="bg-amber-500 hover:bg-amber-600"
                      disabled={true}
                    >
                      En attente
                    </Button>
                  ) : isRejected ? (
                    <Button
                      onClick={(e) => handleRetryClick(sfd, e)}
                      className="bg-red-100 text-red-800 hover:bg-red-200"
                      disabled={isSubmitting}
                    >
                      Réessayer
                    </Button>
                  ) : (
                    <Button
                      onClick={(e) => handleJoinClick(sfd, e)}
                      className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                      disabled={isSubmitting}
                    >
                      Rejoindre
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
};

export default SfdList;
