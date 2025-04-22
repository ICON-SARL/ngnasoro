
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileHeader from '@/components/mobile/MobileHeader';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AvailableSfdCard } from '@/components/mobile/sfd-accounts/AvailableSfdCard';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sfd } from '@/types/sfd-types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

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
          
          // Filtrer les SFDs auxquelles l'utilisateur a déjà adhéré ou a des demandes en cours
          const requestedSfdIds = (userRequests || [])
            .filter(req => req.status === 'pending' || req.status === 'approved')
            .map(req => req.sfd_id);
            
          const userSfdIds = (userSfds || []).map(us => us.sfd_id);
          
          // Filtrer les SFDs disponibles
          const availableSfds = directData.filter(sfd => 
            !requestedSfdIds.includes(sfd.id) && 
            !userSfdIds.includes(sfd.id)
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
          <div className="text-center py-12 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
            <p className="text-lg text-amber-800 mb-2">
              Aucune SFD active n'est disponible pour le moment.
            </p>
            <p className="text-sm text-amber-700 mb-4">
              {sfds?.length === 0 
                ? "Vous avez déjà demandé l'adhésion à toutes les SFDs disponibles."
                : "Veuillez contacter l'administrateur du système."}
            </p>
            <Button onClick={() => navigate('/mobile-flow/account')} variant="outline">
              Retour à mon compte
            </Button>
          </div>
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
}
