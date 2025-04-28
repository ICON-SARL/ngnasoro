import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { Building, Plus, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { edgeFunctionApi } from '@/utils/api/modules/edgeFunctionApi';
import { AdhesionRequest } from '@/types/adhesionTypes';

// Define PendingRequest to match AdhesionRequest structure
interface PendingRequest {
  id: string; // Make id required here
  sfd_id: string;
  status: string;
  user_id?: string;
  full_name: string;
  email?: string;
  phone?: string;
  created_at?: string;
  reference_number?: string;
}

interface SfdSelectorProps {
  onSfdSelected?: (sfdId: string) => void;
}

export default function SfdSelector({ onSfdSelected }: SfdSelectorProps) {
  const [availableSfds, setAvailableSfds] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSfds();
  }, [user?.id]);

  const fetchSfds = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch available SFDs
      const { data: sfdsData, error: sfdsError, success: sfdsSuccess } = await edgeFunctionApi.callFunction(
        'fetch-sfds',
        { userId: user.id }
      );

      if (sfdsError || !sfdsSuccess) {
        throw new Error(sfdsError || 'Failed to fetch SFDs');
      }

      setAvailableSfds(sfdsData || []);

      // Fetch pending requests
      const { data: requests, error: requestsError } = await supabase
        .from('client_adhesion_requests')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending');

      if (requestsError) {
        console.error('Error fetching pending requests:', requestsError);
      } else {
        // Add type assertion to ensure id is present
        setPendingRequests(requests.map(req => ({
          ...req,
          id: req.id || '' // Ensure id is always present
        } as PendingRequest)));
      }
    } catch (error) {
      console.error('Error fetching SFDs:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de récupérer la liste des SFDs',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchSfds();
  };

  const handleSfdSelect = (sfdId: string) => {
    if (onSfdSelected) {
      onSfdSelected(sfdId);
    } else {
      navigate('/mobile-flow/adhesion-form', { state: { sfdId } });
    }
  };

  const handleAddSfd = () => {
    navigate('/sfd-selector');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Sélectionner un SFD</h3>
        <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
          {isRefreshing ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </div>

      {availableSfds.length === 0 && pendingRequests.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Building className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">Aucun SFD disponible</h3>
            <p className="text-sm text-gray-500 mb-4">
              Vous n'avez pas encore de SFD associé à votre compte.
            </p>
            <Button onClick={handleAddSfd} className="bg-[#0D6A51] hover:bg-[#0D6A51]/90">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un SFD
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {availableSfds.map((sfd) => (
            <Card key={sfd.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4" onClick={() => handleSfdSelect(sfd.id)}>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                    {sfd.logo_url ? (
                      <img src={sfd.logo_url} alt={sfd.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <Building className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium">{sfd.name}</h4>
                    <p className="text-sm text-gray-500">{sfd.region || sfd.code}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {pendingRequests.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Demandes en attente</h4>
              {pendingRequests.map((request) => (
                <Card key={request.id} className="mb-2 bg-amber-50 border-amber-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mr-3">
                          <Building className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Demande en cours</h4>
                          <p className="text-sm text-amber-700">En attente de validation</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Button onClick={handleAddSfd} className="w-full mt-2">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un autre SFD
          </Button>
        </div>
      )}
    </div>
  );
}
