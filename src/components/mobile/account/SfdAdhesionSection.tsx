
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, PlusCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader } from '@/components/ui/loader';
import EmptySfdState from '@/components/mobile/EmptySfdState';
import UserRequestsList from './sfd-adhesion/UserRequestsList';
import { useSfdAdhesion } from '@/hooks/sfd/useSfdAdhesion';

const SfdAdhesionSection: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { availableSfds, userRequests, isLoading, refetch } = useSfdAdhesion();
  
  const handleGoToSfdConnection = () => {
    // Directement vers la page de sélection SFD plutôt que la page de connexion
    navigate('/mobile-flow/sfd-selector');
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
                  handleGoToSfdConnection();
                }}
                className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Rejoindre une SFD
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SfdAdhesionSection;
