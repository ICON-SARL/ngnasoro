
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Building, Loader2 } from 'lucide-react';
import SfdList from '@/components/mobile/sfd/SfdList';
import { supabase } from '@/integrations/supabase/client';
import { handleError } from '@/utils/errorHandler';

interface LocationState {
  selectedSfdId?: string;
}

interface Sfd {
  id: string;
  name: string;
  code: string;
  region?: string;
  status: string;
  logo_url?: string;
}

const SfdSelectorPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingRequests, setExistingRequests] = useState<{sfd_id: string, status: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sfds, setSfds] = useState<Sfd[]>([]);
  
  const { selectedSfdId } = (location.state as LocationState) || {};

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      
      try {
        // 1. Récupérer toutes les SFDs actives avec logging détaillé
        console.log('Fetching SFDs - Debug info');
        const { data: sfdsData, error: sfdsError } = await supabase
          .from('sfds')
          .select('*')
          .eq('status', 'active');
          
        if (sfdsError) {
          console.error('Error fetching SFDs:', sfdsError);
          throw sfdsError;
        }
        
        console.log(`Fetched ${sfdsData?.length || 0} SFDs from database:`, sfdsData);
        
        // Si aucune SFD n'est disponible, essayer l'edge function
        if (!sfdsData || sfdsData.length === 0) {
          console.log('No SFDs found in database, trying edge function');
          try {
            const { data: edgeFunctionData, error: edgeFunctionError } = await supabase.functions.invoke('fetch-sfds', {
              body: { userId: user.id }
            });
            
            if (edgeFunctionError) {
              console.error('Error fetching SFDs from edge function:', edgeFunctionError);
            } else if (edgeFunctionData && edgeFunctionData.length > 0) {
              console.log(`Fetched ${edgeFunctionData.length} SFDs from Edge function:`, edgeFunctionData);
              sfdsData = edgeFunctionData;
            }
          } catch (edgeError) {
            console.error('Exception in edge function call:', edgeError);
          }
        }
        
        // 2. Récupérer les demandes existantes
        console.log('Fetching existing client adhesion requests');
        const { data: existingReqs, error: requestsError } = await supabase
          .from('client_adhesion_requests')
          .select('sfd_id, status')
          .eq('user_id', user.id);
          
        if (requestsError) {
          console.error('Error fetching adhesion requests:', requestsError);
          throw requestsError;
        }
        
        console.log('Existing adhesion requests:', existingReqs);
        setExistingRequests(existingReqs || []);
        
        // 3. Récupérer les SFDs déjà associées à l'utilisateur
        const { data: userSfds, error: userSfdsError } = await supabase
          .from('user_sfds')
          .select('sfd_id')
          .eq('user_id', user.id);
          
        if (userSfdsError) {
          console.error('Error fetching user SFDs:', userSfdsError);
          throw userSfdsError;
        }
        
        console.log(`User has ${userSfds?.length || 0} SFDs already associated:`, userSfds);
        
        // Filtrer les SFDs déjà associées à l'utilisateur
        const userSfdIds = userSfds?.map(us => us.sfd_id) || [];
        
        // Même si aucune SFD n'est disponible en base de données, utiliser des données de test en dev
        if (!sfdsData || sfdsData.length === 0) {
          console.log('Using test SFDs for development');
          const testSfds = [
            {
              id: 'test-sfd1',
              name: 'RMCR (Test)',
              code: 'RMCR',
              region: 'Centre',
              status: 'active',
              logo_url: null
            },
            {
              id: 'test-sfd2',
              name: 'NYESIGISO (Test)',
              code: 'NYESIGISO',
              region: 'Sud',
              status: 'active',
              logo_url: null
            }
          ];
          
          setSfds(testSfds);
        } else {
          // On affiche toutes les SFDs disponibles même si l'utilisateur a déjà des demandes en cours
          // pour permettre d'en faire de nouvelles ou de réessayer
          const availableSfds = sfdsData.filter(sfd => 
            !userSfdIds.includes(sfd.id) && sfd.status === 'active'
          );
          
          console.log(`After filtering, ${availableSfds.length} SFDs are available for selection:`, availableSfds);
          setSfds(availableSfds);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        handleError(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user?.id, toast]);

  const handleSendRequest = (sfdId: string) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour envoyer une demande",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // On permet d'envoyer une nouvelle demande même si une demande rejetée existe déjà
      console.log(`Redirecting to adhesion page for SFD: ${sfdId}`);
      // Rediriger vers la page d'adhésion SFD
      navigate(`/mobile-flow/sfd-adhesion/${sfdId}`);
      
    } catch (err) {
      console.error('Error handling join request:', err);
      handleError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetryRequest = (sfdId: string) => {
    console.log(`Handling retry request for SFD: ${sfdId}`);
    navigate(`/mobile-flow/sfd-adhesion/${sfdId}`);
  };

  const handleEditRequest = (sfdId: string) => {
    console.log(`Handling edit request for SFD: ${sfdId}`);
    navigate(`/mobile-flow/sfd-adhesion/${sfdId}?mode=edit`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm p-4 flex items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour
        </Button>
        <h1 className="text-lg font-medium flex-1 text-center text-[#0D6A51]">
          SFDs Disponibles
        </h1>
        <div className="w-10"></div>
      </header>
      
      <main className="flex-1 container mx-auto max-w-md p-4">
        <Card className="p-4 mb-4 bg-white shadow-sm">
          <div className="flex items-start space-x-3">
            <Building className="h-6 w-6 text-[#0D6A51] mt-1" />
            <div>
              <h2 className="font-medium text-gray-900">SFDs Partenaires MEREF</h2>
              <p className="text-sm text-gray-600 mt-1">
                Sélectionnez une SFD pour envoyer une demande d'association de compte. 
                L'agent SFD vérifiera votre identité et validera votre compte.
              </p>
            </div>
          </div>
        </Card>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#0D6A51]" />
          </div>
        ) : sfds.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-center mb-4">
              <Building className="h-16 w-16 text-gray-300" />
            </div>
            <h3 className="text-xl font-medium mb-2">Aucune SFD disponible</h3>
            <p className="text-gray-500 mb-6">
              Il n'y a actuellement aucune SFD disponible pour une nouvelle adhésion.
              {existingRequests.length > 0 && " Vous avez déjà des demandes en cours."}
            </p>
            <Button onClick={() => navigate('/mobile-flow/account')} className="bg-[#0D6A51] hover:bg-[#0D6A51]/90">
              Retour à mon compte
            </Button>
          </div>
        ) : (
          <SfdList 
            sfds={sfds}
            existingRequests={existingRequests}
            isSubmitting={isSubmitting}
            onSelectSfd={handleSendRequest}
            onRetry={handleRetryRequest}
            onEdit={handleEditRequest}
          />
        )}
      </main>
    </div>
  );
};

export default SfdSelectorPage;
