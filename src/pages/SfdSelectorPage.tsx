
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
        // 1. Récupérer les SFDs via la fonction Edge
        console.log('Fetching SFDs from Edge function');
        const { data: sfdsData, error: sfdsError } = await supabase.functions.invoke('fetch-sfds', {
          body: { userId: user.id }
        });
        
        if (sfdsError) throw sfdsError;
        
        // Vérifier les données SFDs
        if (!Array.isArray(sfdsData)) {
          console.error('Invalid SFDs data format:', sfdsData);
          throw new Error('Format de données SFD invalide');
        }
        
        console.log(`Loaded ${sfdsData.length} SFDs from Edge function`);
        setSfds(sfdsData);
        
        // 2. Récupérer les demandes existantes (adhesion requests plutôt que sfd_clients)
        console.log('Fetching existing client adhesion requests');
        const { data: existingReqs, error: requestsError } = await supabase
          .from('client_adhesion_requests')
          .select('sfd_id, status')
          .eq('user_id', user.id);
          
        if (requestsError) throw requestsError;
        
        setExistingRequests(existingReqs || []);
        console.log(`Found ${existingReqs?.length || 0} existing client adhesion requests`);
      } catch (err) {
        console.error('Error loading data:', err);
        handleError(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user?.id, toast]);

  const handleSendRequest = async (sfdId: string) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour envoyer une demande",
        variant: "destructive",
      });
      return;
    }

    // Vérifier si l'utilisateur a déjà une demande pour cette SFD
    const existingRequest = existingRequests.find(req => req.sfd_id === sfdId);
    if (existingRequest) {
      if (existingRequest.status === 'approved') {
        toast({
          title: "Information",
          description: "Vous êtes déjà client de cette SFD",
        });
      } else {
        toast({
          title: "Information",
          description: "Vous avez déjà une demande en cours pour cette SFD",
        });
      }
      return;
    }

    // Rediriger vers la page d'adhésion SFD
    navigate(`/mobile-flow/sfd-adhesion/${sfdId}`);
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
        ) : (
          <SfdList 
            onSelectSfd={handleSendRequest} 
            existingRequests={existingRequests}
            isSubmitting={isSubmitting}
            sfds={sfds}
          />
        )}
      </main>
    </div>
  );
};

export default SfdSelectorPage;
