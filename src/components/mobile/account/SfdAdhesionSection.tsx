
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader } from '@/components/ui/loader';
import EmptySfdState from '@/components/mobile/EmptySfdState';
import UserRequestsList from './sfd-adhesion/UserRequestsList';
import AvailableSfdsList from './sfd-adhesion/AvailableSfdsList';
import { useSfdAdhesion } from '@/hooks/sfd/useSfdAdhesion';
import { AvailableSfd } from '@/components/mobile/profile/sfd-accounts/types/SfdAccountTypes';

const SfdAdhesionSection: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { availableSfds, userRequests, isLoading, requestSfdAdhesion, refetch } = useSfdAdhesion();
  
  const handleOpenSfdDialog = (sfd: AvailableSfd) => {
    const existingRequest = userRequests.find(req => req.sfd_id === sfd.id);
    
    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        toast({
          title: 'Demande en cours',
          description: `Vous avez déjà une demande en attente pour ${sfd.name}`,
        });
      } else if (existingRequest.status === 'approved') {
        toast({
          title: 'Déjà membre',
          description: `Vous êtes déjà membre de ${sfd.name}`,
        });
      } else if (existingRequest.status === 'rejected') {
        toast({
          title: 'Demande rejetée',
          description: `Votre demande précédente à ${sfd.name} a été rejetée. Contactez l'administrateur pour plus d'informations.`,
          variant: 'destructive',
        });
      }
      return;
    }
    
    navigate(`/mobile-flow/sfd-adhesion/${sfd.id}`);
  };
  
  const handleGoToSfdSetup = () => {
    navigate('/sfd-setup');
  };
  
  const handleContainerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleRequestUpdated = () => {
    // Refresh the data when a request is updated
    if (refetch) {
      refetch();
    }
  };
  
  return (
    <Card className="mb-6" onClick={handleContainerClick}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Building className="h-5 w-5 mr-2 text-[#0D6A51]" />
          Comptes SFD
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader size="md" />
          </div>
        ) : availableSfds.length === 0 && userRequests.length === 0 ? (
          <EmptySfdState />
        ) : (
          <div className="space-y-4">
            <UserRequestsList 
              requests={userRequests} 
              onRequestUpdated={handleRequestUpdated}
            />
            
            <div className="pt-2">
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleGoToSfdSetup();
                }}
                className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
              >
                <Building className="h-4 w-4 mr-2" />
                Gérer mes comptes SFD
              </Button>
              
              <AvailableSfdsList 
                sfds={availableSfds}
                onSfdSelect={handleOpenSfdDialog}
                onViewMore={handleGoToSfdSetup}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SfdAdhesionSection;
