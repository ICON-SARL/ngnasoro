
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface AvailableSfd {
  id: string;
  name: string;
  code: string;
  region?: string;
  logo_url?: string | null;
}

export interface SfdRequest {
  id: string;
  user_id: string;
  sfd_id: string;
  status: string;
  created_at: string;
}

export function useAvailableSfds(userId: string | undefined) {
  const [availableSfds, setAvailableSfds] = useState<AvailableSfd[]>([]);
  const [pendingRequests, setPendingRequests] = useState<SfdRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;
    
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch all SFDs
        const { data: allSfds, error: sfdsError } = await supabase
          .from('sfds')
          .select('*')
          .eq('status', 'active');

        if (sfdsError) throw sfdsError;

        // Fetch user's existing SFD associations
        const { data: userSfds, error: userSfdsError } = await supabase
          .from('user_sfds')
          .select('sfd_id')
          .eq('user_id', userId);

        if (userSfdsError) throw userSfdsError;

        // Fetch user's pending SFD requests
        const { data: requests, error: requestsError } = await supabase
          .from('sfd_clients')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'pending');

        if (requestsError) throw requestsError;

        // Filter out SFDs that the user is already associated with
        const userSfdIds = new Set(userSfds?.map(relation => relation.sfd_id) || []);
        const requestSfdIds = new Set(requests?.map(request => request.sfd_id) || []);
        
        const available = allSfds?.filter(sfd => !userSfdIds.has(sfd.id)) || [];
        
        setAvailableSfds(available);
        setPendingRequests(requests || []);
      } catch (error) {
        console.error('Error fetching SFDs:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les SFDs disponibles",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId, toast]);

  const requestSfdAccess = async (sfdId: string, phone?: string): Promise<boolean> => {
    if (!userId) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour effectuer cette action",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Create a new SFD client request
      const { data, error } = await supabase
        .from('sfd_clients')
        .insert({
          user_id: userId,
          sfd_id: sfdId,
          status: 'pending',
          phone: phone || null
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state to show the new pending request
      setPendingRequests(prev => [...prev, data as SfdRequest]);
      
      toast({
        title: "Demande envoyée",
        description: "Votre demande a été envoyée avec succès",
      });
      
      return true;
    } catch (error: any) {
      console.error('Error requesting SFD access:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'envoi de la demande",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    availableSfds,
    pendingRequests,
    isLoading,
    requestSfdAccess
  };
}
