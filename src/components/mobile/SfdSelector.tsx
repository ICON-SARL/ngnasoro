
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Building } from 'lucide-react';
import { useAvailableSfds } from '@/hooks/sfd/useAvailableSfds';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const SfdSelector = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedSfd, setSelectedSfd] = useState<string | null>(null);

  // Fetch user's adhesion requests
  const { data: adhesionRequests, isLoading: isLoadingAdhesions } = useQuery({
    queryKey: ['adhesion-requests', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('client_adhesion_requests')
        .select('*')
        .eq('user_id', user.id);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  const hasApprovedAdhesions = adhesionRequests?.some(
    request => request.status === 'approved'
  );

  const { availableSfds, isLoading: isLoadingSfds } = useAvailableSfds(user?.id || '');

  const isLoading = isLoadingAdhesions || isLoadingSfds;

  const handleGoBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="container max-w-md mx-auto p-4">
        <Button variant="ghost" onClick={handleGoBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Retour
        </Button>
        <Card>
          <CardContent className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasApprovedAdhesions) {
    return (
      <div className="container max-w-md mx-auto p-4">
        <Button variant="ghost" onClick={handleGoBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Retour
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-center">SFDs non disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertTitle>Adhésion requise</AlertTitle>
              <AlertDescription className="mt-2">
                Vous devez d'abord adhérer à une SFD avant de pouvoir accéder à ses services. 
                Pour adhérer à une SFD, rendez-vous dans la section "Adhésion".
              </AlertDescription>
            </Alert>
            <div className="mt-4 flex justify-center">
              <Button 
                onClick={() => navigate('/mobile-flow/sfd-adhesion')}
                className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
              >
                Faire une demande d'adhésion
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show SFDs only if user has approved adhesions
  return (
    <div className="container max-w-md mx-auto p-4">
      <Button variant="ghost" onClick={handleGoBack} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" /> Retour
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-center">Sélectionner une SFD</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {availableSfds.map(sfd => (
              <div 
                key={sfd.id}
                className="p-4 border rounded-lg cursor-pointer hover:border-primary"
                onClick={() => navigate(`/mobile-flow/sfd/${sfd.id}`)}
              >
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                    <Building className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{sfd.name}</h3>
                    <p className="text-sm text-muted-foreground">{sfd.region || sfd.code}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SfdSelector;
