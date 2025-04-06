
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
      
      setPendingRequests(pendingSfdRequests || []);
      
      // Get IDs of SFDs that user has pending requests for
      const pendingSfdIds = pendingSfdRequests?.map(request => request.sfd_id) || [];
      
      // Combine existing SFDs and pending SFDs to exclude from available list
      const excludeSfdIds = [...userSfdIds, ...pendingSfdIds];
      
      // Then get all active SFDs that user doesn't already have or has pending requests for
      const { data: sfds, error: sfdsError } = await supabase
        .from('sfds')
        .select('id, name, code, region, logo_url, status')
        .eq('status', 'active')
        .not('id', 'in', `(${excludeSfdIds.length > 0 ? excludeSfdIds.join(',') : 'null'})`);
      
      if (sfdsError) throw sfdsError;
      
      setAvailableSfds(sfds || []);
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
      const existingRequest = pendingRequests.find(req => req.sfd_id === sfdId);
      if (existingRequest) {
        toast({
          title: 'Demande déjà envoyée',
          description: 'Vous avez déjà une demande en cours pour cette SFD',
        });
        return false;
      }
      
      // Create a client request entry
      const { data, error } = await supabase
        .from('sfd_clients')
        .insert({
          user_id: userId,
          sfd_id: sfdId,
          full_name: '', // Will be updated from user profile
          phone: phoneNumber || null,
          status: 'pending',
          kyc_level: 0
        })
        .select();
        
      if (error) throw error;
      
      // Update the client with user profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', userId)
        .single();
        
      if (profile) {
        await supabase
          .from('sfd_clients')
          .update({ 
            full_name: profile.full_name || 'Client' 
          })
          .eq('id', data[0].id);
      }
      
      // Refresh the pending requests list
      fetchAvailableSfds();
      
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
