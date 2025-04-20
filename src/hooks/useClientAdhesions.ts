
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface ClientAdhesionRequest {
  id: string;
  sfd_id: string;
  user_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  id_type: string | null;
  id_number: string | null;
  monthly_income: number | null;
  status: string;
  notes: string | null;
  created_at: string;
  processed_at: string | null;
  processed_by: string | null;
  rejection_reason: string | null;
  kyc_status: string | null;
  verification_stage: string | null;
  profession: string | null;
  source_of_income: string | null;
  reference_number: string | null;
  sfd_name?: string;
  sfds?: {
    name: string;
    logo_url?: string;
  };
}

export interface AdhesionRequestInput {
  full_name: string;
  email?: string;
  phone?: string;
  address?: string;
  profession?: string;
  monthly_income?: string;
  source_of_income?: string;
  id_type?: string;
  id_number?: string;
}

export const useClientAdhesions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: adhesionRequests = [],
    isLoading: isLoadingAdhesionRequests,
    refetch: refetchAdhesionRequests,
  } = useQuery({
    queryKey: ['client-adhesions'],
    queryFn: async () => {
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
    },
    enabled: !!user,
  });

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

  return {
    adhesionRequests,
    isLoadingAdhesionRequests,
    refetchAdhesionRequests,
    processAdhesion,
  };
};
