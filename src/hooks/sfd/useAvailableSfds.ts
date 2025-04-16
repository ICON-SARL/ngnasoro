
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AvailableSfd, SfdClientRequest } from '@/components/mobile/profile/sfd-accounts/types/SfdAccountTypes';

/**
 * Hook to fetch and manage available SFDs that can be added to a user account
 */
export function useAvailableSfds(userId?: string) {
  const [availableSfds, setAvailableSfds] = useState<AvailableSfd[]>([]);
  const [pendingRequests, setPendingRequests] = useState<SfdClientRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch all available SFDs that the user doesn't already have
  const fetchAvailableSfds = async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // First get user's existing SFDs
      const { data: userSfds, error: userSfdsError } = await supabase
        .from('user_sfds')
        .select('sfd_id')
        .eq('user_id', userId);
      
      if (userSfdsError) throw userSfdsError;
      
      const userSfdIds = userSfds?.map(item => item.sfd_id) || [];
      
      // Get pending client requests to avoid duplicate requests
      const { data: pendingSfdRequests, error: pendingRequestsError } = await supabase
        .from('sfd_clients')
        .select('id, sfd_id, status, created_at')
        .eq('user_id', userId);
        
      if (pendingRequestsError) throw pendingRequestsError;
      
      // If there are no pendingSfdRequests, check client_adhesion_requests
      let pendingAdhesionRequests: any[] = [];
      if (!pendingSfdRequests || pendingSfdRequests.length === 0) {
        const { data: adhesionRequests, error: adhesionError } = await supabase
          .from('client_adhesion_requests')
          .select('id, sfd_id, status, created_at')
          .eq('user_id', userId);
          
        if (!adhesionError && adhesionRequests) {
          pendingAdhesionRequests = adhesionRequests;
        }
      }
      
      // Get all SFDs to find the names
      const { data: allSfds, error: allSfdsError } = await supabase
        .from('sfds')
        .select('id, name, code, region, logo_url, status')
        .eq('status', 'active');
        
      if (allSfdsError) throw allSfdsError;
      
      // Map SFD names to requests
      const pendingRequestsWithNames = [
        ...(pendingSfdRequests || []),
        ...(pendingAdhesionRequests || [])
      ].map(request => {
        const sfd = allSfds?.find(s => s.id === request.sfd_id);
        return {
          ...request,
          sfd_name: sfd?.name
        } as SfdClientRequest;
      });
      
      // Cast the response to the correct type
      setPendingRequests(pendingRequestsWithNames || []);
      
      // Pour ce problème spécifique, affichons toutes les SFDs actives même si l'utilisateur a déjà des demandes en cours
      setAvailableSfds(allSfds || []);
      
    } catch (err: any) {
      console.error('Error fetching available SFDs:', err);
      setError(err.message);
      toast({
        title: 'Erreur',
        description: 'Impossible de récupérer la liste des SFDs disponibles',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Request access to a SFD
  const requestSfdAccess = async (sfdId: string, phoneNumber?: string) => {
    if (!userId) {
      toast({
        title: 'Erreur',
        description: 'Vous devez être connecté pour effectuer cette action',
        variant: 'destructive',
      });
      return false;
    }

    try {
      setIsLoading(true);
      
      // Check if user already has a pending request for this SFD
      const existingRequest = pendingRequests.find(req => 
        req.sfd_id === sfdId && ['pending', 'pending_validation'].includes(req.status)
      );
      
      if (existingRequest) {
        toast({
          title: 'Demande déjà envoyée',
          description: 'Vous avez déjà une demande en cours pour cette SFD',
        });
        return false;
      }
      
      // Try to get user profile data first
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, email, avatar_url')
        .eq('id', userId)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching user profile:', profileError);
      }
      
      // Try to get auth user data as fallback
      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error fetching auth user:', userError);
      }
      
      // Create a client adhesion request entry
      const { data, error } = await supabase
        .from('client_adhesion_requests')
        .insert({
          user_id: userId,
          sfd_id: sfdId,
          full_name: profile?.full_name || authUser?.user_metadata?.name || '',
          email: authUser?.email || '',
          phone: phoneNumber || null,
          status: 'pending',
          reference_number: `ADH-${crypto.randomUUID().slice(0, 8)}`
        })
        .select();
        
      if (error) {
        console.error('Error creating adhesion request:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        throw new Error('Aucune donnée retournée après création de la demande');
      }
      
      // Refresh the pending requests list
      await fetchAvailableSfds();
      
      toast({
        title: 'Demande envoyée',
        description: 'Votre demande a été envoyée avec succès. Vous serez notifié lorsqu\'elle sera traitée.',
      });
      
      return true;
    } catch (err: any) {
      console.error('Error sending SFD request:', err);
      toast({
        title: 'Erreur',
        description: `Impossible d'envoyer votre demande : ${err.message}`,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchAvailableSfds();
    }
  }, [userId]);

  return {
    availableSfds,
    pendingRequests,
    isLoading,
    error,
    fetchAvailableSfds,
    requestSfdAccess
  };
}
