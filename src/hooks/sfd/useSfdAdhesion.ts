
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useSfdAdhesion() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableSfds, setAvailableSfds] = useState<any[]>([]);
  const [userRequests, setUserRequests] = useState<any[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // Fetch available SFDs
      const { data: sfds, error: sfdsError } = await supabase
        .from('sfds')
        .select('*')
        .eq('status', 'active');

      if (sfdsError) throw sfdsError;
      setAvailableSfds(sfds || []);

      // Fetch user's requests
      const { data: requests, error: requestsError } = await supabase
        .from('client_adhesion_requests')
        .select('*, sfds:sfd_id(*)')
        .eq('user_id', user.id);

      if (requestsError) throw requestsError;
      setUserRequests(requests || []);
    } catch (error) {
      console.error('Error fetching SFD data:', error);
      toast({
        title: 'Erreur',
        description: "Impossible de récupérer les données SFD",
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const requestSfdAdhesion = useCallback(async (
    sfdId: string, 
    adhesionData: {
      full_name: string;
      email?: string;
      phone?: string;
      address?: string;
      id_number?: string;
      id_type?: string;
      profession?: string;
      monthly_income?: number;
      source_of_income?: string;
    }
  ) => {
    if (!user?.id) return false;
    
    setIsSubmitting(true);
    try {
      // Check if request already exists
      const { data: existingRequest, error: checkError } = await supabase
        .from('client_adhesion_requests')
        .select('*')
        .eq('user_id', user.id)
        .eq('sfd_id', sfdId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') throw checkError;

      if (existingRequest) {
        if (existingRequest.status === 'pending') {
          toast({
            title: 'Demande déjà envoyée',
            description: 'Vous avez déjà une demande en attente pour cette SFD',
          });
          return false;
        }
        
        if (existingRequest.status === 'approved') {
          toast({
            title: 'Déjà adhérent',
            description: 'Vous êtes déjà adhérent à cette SFD',
          });
          return false;
        }
      }

      // Insert new request
      const { error: insertError } = await supabase
        .from('client_adhesion_requests')
        .insert({
          user_id: user.id,
          sfd_id: sfdId,
          status: 'pending',
          ...adhesionData,
          reference_number: `ADH-${Date.now().toString().substring(6)}`,
          verification_stage: 'id_verification',
          kyc_status: 'pending',
          created_at: new Date().toISOString()
        });

      if (insertError) throw insertError;

      toast({
        title: 'Demande envoyée',
        description: 'Votre demande d\'adhésion a été envoyée avec succès',
      });
      
      await fetchData();
      return true;
    } catch (error) {
      console.error('Error submitting SFD adhesion request:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer votre demande d\'adhésion',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [user, toast, fetchData]);

  return {
    availableSfds,
    userRequests,
    isLoading,
    isSubmitting,
    requestSfdAdhesion,
    refetch: fetchData
  };
}
