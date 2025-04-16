import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader } from '@/components/ui/loader';
import { AvailableSfd, SfdClientRequest } from '@/components/mobile/profile/sfd-accounts/types/SfdAccountTypes';
import ClientAdhesionDialog from '@/components/mobile/account/ClientAdhesionDialog';
import EmptySfdState from '@/components/mobile/EmptySfdState';

const SfdAdhesionSection: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [availableSfds, setAvailableSfds] = useState<AvailableSfd[]>([]);
  const [userRequests, setUserRequests] = useState<SfdClientRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSfd, setSelectedSfd] = useState<AvailableSfd | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data: sfds, error: sfdsError } = await supabase
          .from('sfds')
          .select('id, name, code, region, status, logo_url, description')
          .eq('status', 'active');
        
        if (sfdsError) throw sfdsError;
        
        const { data: requests, error: requestsError } = await supabase
          .from('client_adhesion_requests')
          .select('id, sfd_id, status, created_at, sfds:sfd_id(name)')
          .eq('user_id', user.id);
        
        if (requestsError) throw requestsError;
        
        const formattedRequests: SfdClientRequest[] = requests.map(request => ({
          id: request.id,
          sfd_id: request.sfd_id,
          sfd_name: request.sfds?.name,
          status: request.status,
          created_at: request.created_at
        }));
        
        setAvailableSfds(sfds as AvailableSfd[]);
        setUserRequests(formattedRequests);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les données des SFD',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user, toast]);
  
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
  
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedSfd(null);
  };
  
  const handleGoToSfdSetup = () => {
    navigate('/sfd-setup');
  };
  
  const renderRequestStatus = (request: SfdClientRequest) => {
    if (request.status === 'pending') {
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
          En attente
        </Badge>
      );
    } else if (request.status === 'approved') {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
          Approuvée
        </Badge>
      );
    } else if (request.status === 'rejected') {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
          Rejetée
        </Badge>
      );
    }
    
    return null;
  };
  
  const handleContainerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
            {userRequests.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm font-medium">Vos demandes d'adhésion</p>
                {userRequests.map(request => (
                  <div key={request.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                    <div>
                      <p className="font-medium">{request.sfd_name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(request.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    {renderRequestStatus(request)}
                  </div>
                ))}
              </div>
            ) : null}
            
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
              
              {availableSfds.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">SFDs disponibles</p>
                  <div className="grid grid-cols-2 gap-2">
                    {availableSfds.slice(0, 4).map(sfd => (
                      <Button 
                        key={sfd.id}
                        variant="outline" 
                        className="flex flex-col h-auto items-center justify-center p-3 text-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenSfdDialog(sfd);
                        }}
                      >
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mb-1">
                          <Building className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-xs font-medium">{sfd.name}</span>
                      </Button>
                    ))}
                    {availableSfds.length > 4 && (
                      <Button 
                        variant="outline" 
                        className="flex flex-col h-auto items-center justify-center p-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGoToSfdSetup();
                        }}
                      >
                        <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center mb-1">
                          <Plus className="h-4 w-4 text-gray-600" />
                        </div>
                        <span className="text-xs font-medium">Voir plus</span>
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SfdAdhesionSection;
