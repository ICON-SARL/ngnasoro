
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ClientAdhesionRequest, AdhesionRequestInput } from '@/types/adhesionTypes';

export { AdhesionRequestInput };

export function useClientAdhesions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [retryCount, setRetryCount] = useState(0);
  const [isCreatingRequest, setIsCreatingRequest] = useState(false);

  // Récupération des adhésions
  const { 
    data: adhesionRequests = [], 
    isLoading: isLoadingAdhesionRequests, 
    refetch: refetchAdhesionRequests 
  } = useQuery({
    queryKey: ['client-adhesions'],
    queryFn: async () => {
      if (!user) {
        console.log('No user, cannot fetch adhesion requests');
        return [];
      }
      
      try {
        const { data, error } = await supabase
          .from('client_adhesion_requests')
          .select('*, sfds:sfd_id(name, logo_url)')
          .order('created_at', { ascending: false });

        if (error) {
          toast({
            title: 'Erreur',
            description: 'Impossible de charger les demandes d\'adhésion',
            variant: 'destructive',
          });
          throw error;
        }

        return data as ClientAdhesionRequest[];
      } catch (err) {
        console.error('Error fetching adhesion requests:', err);
        setRetryCount(prev => prev + 1);
        return [];
      }
    },
    enabled: !!user,
  });

  // Traitement des adhésions
  const processAdhesion = useMutation({
    mutationFn: async ({ 
      requestId, 
      action, 
      notes 
    }: { 
      requestId: string; 
      action: 'approve' | 'reject'; 
      notes?: string; 
    }) => {
      if (!user) throw new Error('Non authentifié');

      const updateData = {
        status: action === 'approve' ? 'approved' : 'rejected',
        processed_by: user.id,
        processed_at: new Date().toISOString(),
        notes: notes,
        ...(action === 'reject' && { rejection_reason: notes }),
      };

      const { data, error } = await supabase
        .from('client_adhesion_requests')
        .update(updateData)
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-adhesions'] });
      toast({
        title: 'Succès',
        description: 'La demande d\'adhésion a été traitée',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: `Erreur lors du traitement de la demande: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Submit adhesion request function
  const submitAdhesionRequest = async (sfdId: string, data: AdhesionRequestInput) => {
    if (!user?.id) {
      return { success: false, error: "User not authenticated" };
    }
    
    setIsCreatingRequest(true);
    try {
      const { data: response, error } = await supabase
        .from('client_adhesion_requests')
        .insert({
          sfd_id: sfdId,
          user_id: user.id,
          full_name: data.full_name,
          email: data.email || null,
          phone: data.phone || null,
          address: data.address || null,
          profession: data.profession || null,
          monthly_income: data.monthly_income ? parseFloat(data.monthly_income) : null,
          source_of_income: data.source_of_income || null,
          status: 'pending',
          reference_number: `ADH-${Date.now().toString().substring(6)}`
        })
        .select()
        .single();

      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['client-adhesions'] });
      
      toast({
        title: "Demande soumise",
        description: "Votre demande d'adhésion a été soumise avec succès",
      });
      
      return { success: true, data: response };
    } catch (error: any) {
      console.error('Error submitting adhesion request:', error);
      
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la soumission de la demande",
        variant: "destructive",
      });
      
      return { success: false, error: error.message };
    } finally {
      setIsCreatingRequest(false);
    }
  };

  return {
    adhesionRequests,
    isLoadingAdhesionRequests,
    refetchAdhesionRequests,
    processAdhesion,
    retryCount,
    submitAdhesionRequest,
    isCreatingRequest
  };
}
