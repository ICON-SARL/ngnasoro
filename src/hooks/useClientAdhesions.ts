
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ClientAdhesionRequest } from '@/types/adhesionTypes';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

// Update the interface definition to make properties consistent
export interface AdhesionRequestInput {
  full_name: string;
  profession: string;
  monthly_income: string;
  source_of_income: string;
  phone: string;
  email: string;
  address: string;
}

export const useClientAdhesions = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreatingRequest, setIsCreatingRequest] = useState(false);

  // Fetch user's adhesion requests
  const { 
    data: userAdhesionRequests,
    isLoading: isLoadingUserAdhesionRequests,
    refetch: refetchUserAdhesionRequests
  } = useQuery({
    queryKey: ['userAdhesionRequests', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('client_adhesion_requests')
        .select('*')
        .eq('user_id', user.id);
        
      if (error) throw error;
      return data as ClientAdhesionRequest[];
    },
    enabled: !!user?.id
  });

  // Fetch SFD adhesion requests (for SFD admins)
  const {
    data: adhesionRequests = [],
    isLoading: isLoadingAdhesionRequests,
    refetch: refetchAdhesionRequests
  } = useQuery({
    queryKey: ['adhesionRequests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_adhesion_requests')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as ClientAdhesionRequest[];
    },
    enabled: !!user?.id
  });

  // Submit adhesion request
  const submitAdhesionRequest = async (sfdId: string, input: AdhesionRequestInput) => {
    try {
      setIsCreatingRequest(true);
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('client_adhesion_requests')
        .insert({
          sfd_id: sfdId,
          user_id: user.id,
          full_name: input.full_name,
          profession: input.profession,
          monthly_income: parseFloat(input.monthly_income),
          source_of_income: input.source_of_income,
          phone: input.phone,
          email: input.email,
          address: input.address,
          status: 'pending',
          kyc_status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['userAdhesionRequests'] });
      
      toast({
        title: "Demande envoyée",
        description: "Votre demande d'adhésion a été envoyée avec succès"
      });
      
      return { success: true, data };
    } catch (error: any) {
      console.error('Error submitting adhesion request:', error);
      
      toast({
        title: "Erreur",
        description: error.message || 'Une erreur est survenue lors de l\'envoi de votre demande',
        variant: "destructive"
      });
      
      return { 
        success: false, 
        error: error.message || 'Une erreur est survenue lors de l\'envoi de votre demande' 
      };
    } finally {
      setIsCreatingRequest(false);
    }
  };

  // Approve adhesion request
  const approveAdhesionRequest = async (adhesionId: string, notes?: string) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('client_adhesion_requests')
        .update({
          status: 'approved',
          processed_at: new Date().toISOString(),
          processed_by: user.id,
          notes: notes
        })
        .eq('id', adhesionId);

      if (error) throw error;
      
      await queryClient.invalidateQueries({ queryKey: ['adhesionRequests'] });
      
      toast({
        title: "Demande approuvée",
        description: "La demande d'adhésion a été approuvée"
      });
      
      return true;
    } catch (error: any) {
      console.error('Error approving adhesion request:', error);
      
      toast({
        title: "Erreur",
        description: error.message || 'Une erreur est survenue lors de l\'approbation de la demande',
        variant: "destructive"
      });
      
      return false;
    }
  };

  // Reject adhesion request
  const rejectAdhesionRequest = async (adhesionId: string, notes?: string) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('client_adhesion_requests')
        .update({
          status: 'rejected',
          processed_at: new Date().toISOString(),
          processed_by: user.id,
          notes: notes
        })
        .eq('id', adhesionId);

      if (error) throw error;
      
      await queryClient.invalidateQueries({ queryKey: ['adhesionRequests'] });
      
      toast({
        title: "Demande rejetée",
        description: "La demande d'adhésion a été rejetée"
      });
      
      return true;
    } catch (error: any) {
      console.error('Error rejecting adhesion request:', error);
      
      toast({
        title: "Erreur",
        description: error.message || 'Une erreur est survenue lors du rejet de la demande',
        variant: "destructive"
      });
      
      return false;
    }
  };

  return {
    userAdhesionRequests: userAdhesionRequests || [],
    isLoadingUserAdhesionRequests,
    refetchUserAdhesionRequests,
    submitAdhesionRequest,
    isCreatingRequest,
    adhesionRequests: adhesionRequests || [],
    isLoadingAdhesionRequests,
    approveAdhesionRequest,
    rejectAdhesionRequest,
    refetchAdhesionRequests
  };
};
