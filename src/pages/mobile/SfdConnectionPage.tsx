
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileHeader from '@/components/mobile/MobileHeader';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, AlertCircle, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Sfd {
  id: string;
  name: string;
  logo_url?: string;
  region?: string;
  code?: string;
  description?: string;
  status: string;
}

export default function SfdConnectionPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [sfds, setSfds] = useState<Sfd[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      if (!user) {
        toast({
          title: 'Connexion requise',
          description: 'Vous devez être connecté pour accéder à cette page',
          variant: 'destructive',
        });
        navigate('/auth');
      }
    };
    
    checkAuth();
  }, [user, navigate, toast]);
  
  useEffect(() => {
    const fetchSfds = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        console.log('Récupération des SFDs actives...');
        
        // Récupérer toutes les SFDs actives
        const { data: sfdsData, error: sfdsError } = await supabase
          .from('sfds')
          .select('*')
          .eq('status', 'active')
          .order('name');
          
        if (sfdsError) throw sfdsError;
        
        console.log(`Trouvé ${sfdsData?.length || 0} SFDs actives`);
        
        // Récupérer les demandes d'adhésion existantes de l'utilisateur
        const { data: userRequests, error: requestsError } = await supabase
          .from('client_adhesion_requests')
          .select('sfd_id, status')
          .eq('user_id', user.id);
          
        if (requestsError) {
          console.warn('Erreur lors de la récupération des demandes:', requestsError);
        }
        
        // Récupérer les SFDs auxquelles l'utilisateur est déjà associé
        const { data: userSfds, error: userSfdsError } = await supabase
          .from('user_sfds')
          .select('sfd_id')
          .eq('user_id', user.id);
          
        if (userSfdsError) {
          console.warn('Erreur lors de la récupération des associations SFD:', userSfdsError);
        }
        
        const userSfdIds = userSfds?.map(us => us.sfd_id) || [];
        
        // Filtrer les SFDs pour n'afficher que celles disponibles
        const availableSfds = (sfdsData || []).filter(sfd => !userSfdIds.includes(sfd.id));
        
        console.log(`Après filtrage: ${availableSfds.length} SFDs disponibles`);
        setSfds(availableSfds);
      } catch (err) {
        console.error('Erreur lors de la récupération des SFDs:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSfds();
  }, [user]);
  
  const handleSfdSelection = (sfdId: string) => {
    navigate(`/mobile-flow/sfd-adhesion/${sfdId}`);
  };
  
  if (!user) {
    return null; // L'utilisateur sera redirigé dans l'useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Choisir une SFD</h1>
          <p className="text-muted-foreground">
            Sélectionnez une institution de microfinance pour commencer
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
            <p className="text-lg text-red-700 mb-2">Erreur lors du chargement des SFDs</p>
            <p className="text-sm text-red-600 mb-4">{error.message}</p>
            <Button onClick={() => window.location.reload()} variant="outline" className="mr-2">
              Réessayer
            </Button>
            <Button onClick={() => navigate(-1)}>
              Retour
            </Button>
          </div>
        ) : sfds.length === 0 ? (
          <Card className="text-center py-12 bg-white rounded-lg border">
            <Building className="h-16 w-16 text-gray-300 mx-auto mb-3" />
            <p className="text-xl font-medium text-gray-700 mb-2">
              Aucune SFD disponible
            </p>
            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
              Il n'y a actuellement aucune SFD disponible pour une nouvelle adhésion. Vous êtes peut-être déjà membre de toutes les SFDs disponibles.
            </p>
            <Button 
              onClick={() => navigate('/mobile-flow/main')} 
              className="bg-[#0D6A51] hover:bg-[#0D6A51]/90 mx-auto"
            >
              Retour à l'accueil
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {sfds.map(sfd => (
              <Card 
                key={sfd.id}
                className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleSfdSelection(sfd.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                      {sfd.logo_url ? (
                        <img src={sfd.logo_url} alt={sfd.name} className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <Building className="h-6 w-6 text-gray-500" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{sfd.name}</h3>
                      <p className="text-sm text-gray-500">
                        {sfd.region || sfd.code || 'SFD'}
                      </p>
                      
                      <div className="mt-2 flex justify-end">
                        <Button
                          className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                        >
                          Rejoindre cette SFD
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
