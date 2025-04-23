
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileHeader from '@/components/mobile/MobileHeader';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AvailableSfdCard } from '@/components/mobile/sfd-accounts/AvailableSfdCard';
import { Loader2, AlertCircle, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sfd } from '@/types/sfd-types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';

export default function SfdConnectionPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Rediriger l'utilisateur vers la page d'authentification s'il n'est pas connecté
  useEffect(() => {
    if (!user) {
      toast({
        title: 'Authentification requise',
        description: 'Vous devez être connecté pour accéder à cette page',
        variant: 'destructive',
      });
      navigate('/auth');
    }
  }, [user, navigate, toast]);
  
  const { data: sfds, isLoading, error, refetch } = useQuery({
    queryKey: ['active-sfds'],
    queryFn: async () => {
      try {
        console.log('Fetching active SFDs from database...');
        
        // Récupérer d'abord les demandes d'adhésion existantes de l'utilisateur
        const { data: userRequests, error: requestsError } = await supabase
          .from('client_adhesion_requests')
          .select('sfd_id, status')
          .eq('user_id', user?.id);
          
        if (requestsError) {
          console.error('Error fetching user requests:', requestsError);
        }
        
        console.log('Existing adhesion requests:', userRequests);
        
        // Récupérer les SFDs auxquelles l'utilisateur est déjà associé
        const { data: userSfds, error: userSfdsError } = await supabase
          .from('user_sfds')
          .select('sfd_id')
          .eq('user_id', user?.id);
          
        if (userSfdsError) {
          console.error('Error fetching user SFDs:', userSfdsError);
        }
        
        console.log('User SFDs:', userSfds);
        
        // Récupérer toutes les SFDs actives
        const { data: directData, error: directError } = await supabase
          .from('sfds')
          .select('*')
          .eq('status', 'active')
          .order('name');
          
        if (directError) {
          console.error('Error fetching SFDs:', directError);
          throw directError;
        }
        
        if (directData && directData.length > 0) {
          console.log(`Found ${directData.length} active SFDs`);
          
          // Filtrer les SFDs déjà associées
          const userSfdIds = (userSfds || []).map(us => us.sfd_id);
          
          // On autorise l'affichage des SFDs même si l'utilisateur a déjà des demandes en cours
          const availableSfds = directData.filter(sfd => 
            !userSfdIds.includes(sfd.id) && sfd.status === 'active'
          );
          
          console.log(`After filtering, ${availableSfds.length} SFDs are available to join`);
          
          return availableSfds as Sfd[];
        }
        
        console.log('No active SFDs found');
        return [] as Sfd[];
      } catch (error) {
        console.error('Failed to fetch SFDs:', error);
        throw error;
      }
    },
    enabled: !!user // N'exécuter la requête que si l'utilisateur est connecté
  });

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
            <p className="text-sm text-red-600 mb-4">Veuillez réessayer plus tard</p>
            <Button onClick={() => refetch()} variant="outline" className="mr-2">
              Réessayer
            </Button>
            <Button onClick={() => navigate(-1)}>
              Retour
            </Button>
          </div>
        ) : !sfds || sfds.length === 0 ? (
          <Card className="text-center py-12 bg-white rounded-lg border">
            <Building className="h-16 w-16 text-gray-300 mx-auto mb-3" />
            <p className="text-xl font-medium text-gray-700 mb-2">
              Aucune SFD disponible
            </p>
            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
              {sfds?.length === 0 
                ? "Il n'y a actuellement aucune SFD disponible pour une nouvelle adhésion."
                : "Veuillez contacter l'administrateur du système."}
            </p>
            <Button 
              onClick={() => navigate('/mobile-flow/account')} 
              className="bg-[#0D6A51] hover:bg-[#0D6A51]/90 mx-auto"
            >
              Retour à mon compte
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {sfds.map(sfd => (
              <AvailableSfdCard key={sfd.id} sfd={sfd} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
