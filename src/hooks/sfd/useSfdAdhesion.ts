
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ClientAdhesionRequest } from '@/types/adhesionTypes';
import { AvailableSfd as SfdAccountTypesAvailableSfd } from '@/components/mobile/profile/sfd-accounts/types/SfdAccountTypes';

export interface AvailableSfd {
  id: string;
  name: string;
  code: string; // Requis pour la compatibilité
  region?: string;
  description?: string; // Ajouté pour correspondre à SfdAccountTypes
  logo_url?: string;
  status: string; // Requis pour la compatibilité
}

export function useSfdAdhesion() {
  const [availableSfds, setAvailableSfds] = useState<AvailableSfd[]>([]);
  const [userRequests, setUserRequests] = useState<ClientAdhesionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const fetchData = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    
    try {
      console.log('Fetching SFD data for user:', user.id);
      
      // Récupérer toutes les SFDs actives
      const { data: sfds, error: sfdsError } = await supabase
        .from('sfds')
        .select('id, name, code, region, description, logo_url, status')
        .eq('status', 'active');
        
      if (sfdsError) {
        console.error('Error fetching SFDs:', sfdsError);
        throw sfdsError;
      }

      console.log('SFDs retrieved from database:', sfds?.length || 0, sfds);
      
      // Si aucune SFD n'est trouvée dans la DB, essayer l'Edge Function
      let allSfds = sfds || [];
      if (!allSfds.length) {
        console.log('No SFDs found in database, trying edge function');
        try {
          const { data: edgeData, error: edgeError } = await supabase.functions.invoke('fetch-sfds', {
            body: { userId: user.id }
          });
          
          if (edgeError) {
            console.error('Error calling edge function:', edgeError);
          } else if (edgeData && edgeData.length) {
            console.log(`Fetched ${edgeData.length} SFDs from edge function`);
            allSfds = edgeData;
          }
        } catch (error) {
          console.error('Error in edge function call:', error);
        }
      }
      
      // Récupérer les demandes d'adhésion de l'utilisateur
      const { data: requests, error: requestsError } = await supabase
        .from('client_adhesion_requests')
        .select(`
          id, 
          user_id,
          sfd_id,
          full_name,
          status,
          created_at,
          processed_at,
          sfds (name, logo_url)
        `)
        .eq('user_id', user.id);
        
      if (requestsError) {
        console.error('Error fetching user requests:', requestsError);
        throw requestsError;
      }
      
      console.log('User adhesion requests:', requests?.length || 0, requests);
      
      // Récupérer les SFDs déjà associées à l'utilisateur
      const { data: userSfds, error: userSfdsError } = await supabase
        .from('user_sfds')
        .select('sfd_id')
        .eq('user_id', user.id);
        
      if (userSfdsError) {
        console.error('Error fetching user SFDs:', userSfdsError);
        throw userSfdsError;
      }
      
      console.log('User associated SFDs:', userSfds?.length || 0, userSfds);
      
      const userSfdIds = userSfds?.map(us => us.sfd_id) || [];
      
      const formattedRequests = requests?.map(req => ({
        id: req.id,
        user_id: req.user_id,
        sfd_id: req.sfd_id,
        full_name: req.full_name,
        status: req.status as 'pending' | 'approved' | 'rejected',
        created_at: req.created_at,
        processed_at: req.processed_at,
        sfd_name: req.sfds?.name || '',
        sfds: req.sfds
      })) || [];
      
      // Filtrage: supprimer les SFDs déjà associées à l'utilisateur
      const filteredSfds = allSfds.filter(sfd => !userSfdIds.includes(sfd.id)) || [];
      
      console.log(`After filtering, ${filteredSfds.length} SFDs are available`);
      
      setUserRequests(formattedRequests);
      setAvailableSfds(filteredSfds);

      // Si toujours aucune SFD après filtrage, ajouter des SFDs de test en environnement dev
      if (filteredSfds.length === 0 && process.env.NODE_ENV !== 'production') {
        console.log('Adding test SFDs for development');
        setAvailableSfds([
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
        ]);
      }
    } catch (error) {
      console.error('Error in useSfdAdhesion:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de récupérer les données SFD',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, [user?.id, toast]);
  
  const requestSfdAdhesion = async (sfdId: string, phoneNumber?: string) => {
    if (!user?.id) {
      toast({
        title: 'Erreur',
        description: 'Vous devez être connecté pour faire une demande d\'adhésion',
        variant: 'destructive',
      });
      return false;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('Requesting adhesion for SFD:', sfdId);
      
      const { data: existingRequest } = await supabase
        .from('client_adhesion_requests')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('sfd_id', sfdId)
        .maybeSingle();
        
      if (existingRequest && existingRequest.status !== 'rejected') {
        toast({
          title: 'Demande existante',
          description: 'Vous avez déjà une demande pour cette SFD',
          variant: 'destructive',
        });
        return false;
      }
      
      if (existingRequest && existingRequest.status === 'rejected') {
        console.log('Deleting existing rejected request:', existingRequest.id);
        await supabase
          .from('client_adhesion_requests')
          .delete()
          .eq('id', existingRequest.id);
      }
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single();
      
      const { data: newRequest, error } = await supabase
        .from('client_adhesion_requests')
        .insert({
          user_id: user.id,
          sfd_id: sfdId,
          full_name: profile?.full_name || 'Utilisateur',
          email: profile?.email || user.email,
          phone: phoneNumber,
          status: 'pending'
        })
        .select();
        
      if (error) {
        console.error('Error creating adhesion request:', error);
        throw error;
      }
      
      console.log('Adhesion request created:', newRequest);
      
      toast({
        title: 'Demande envoyée',
        description: 'Votre demande d\'adhésion a été envoyée avec succès',
      });
      
      await fetchData();
      
      return true;
    } catch (error) {
      console.error('Error in requestSfdAdhesion:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer la demande d\'adhésion',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    availableSfds,
    userRequests,
    isLoading,
    isSubmitting,
    refetch: fetchData,
    requestSfdAdhesion
  };
}
