
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface MerefFundRequest {
  id: string;
  sfd_id: string;
  amount: number;
  purpose: string;
  justification: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  created_at: string;
  approved_at?: string;
  approved_by?: string;
  credited_at?: string;
  comments?: string;
}

interface FundRequestFormData {
  sfdId: string;
  amount: number;
  purpose: string;
  justification: string;
}

export function useMerefFundRequests() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch all fund requests for the current SFD
  const { data: fundRequests, isLoading, error, refetch } = useQuery({
    queryKey: ['meref-fund-requests'],
    queryFn: async () => {
      const { data: requests, error } = await supabase
        .from('meref_fund_requests')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return requests as MerefFundRequest[];
    },
    enabled: !!user,
  });
  
  // Create a new fund request
  const createFundRequestMutation = useMutation({
    mutationFn: async (formData: FundRequestFormData) => {
      const { data, error } = await supabase
        .from('meref_fund_requests')
        .insert({
          sfd_id: formData.sfdId,
          amount: formData.amount,
          purpose: formData.purpose,
          justification: formData.justification,
          status: 'pending',
          requested_by: user?.id,
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Create a notification for MEREF admins
      await supabase.from('admin_notifications').insert({
        title: 'Nouvelle demande de fonds',
        message: `Une nouvelle demande de fonds de ${formData.amount} FCFA a été soumise`,
        recipient_role: 'admin',
        type: 'fund_request',
        action_link: `/admin/fund-requests/${data.id}`,
        sender_id: user?.id,
      });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meref-fund-requests'] });
    },
  });
  
  // Approve a fund request (MEREF admin only)
  const approveFundRequest = useMutation({
    mutationFn: async ({ requestId, comments }: { requestId: string; comments?: string }) => {
      const { data: request, error: requestError } = await supabase
        .from('meref_fund_requests')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user?.id,
          comments,
        })
        .eq('id', requestId)
        .select()
        .single();
        
      if (requestError) throw requestError;
      
      // Create notification for the SFD
      await supabase.from('admin_notifications').insert({
        title: 'Demande de fonds approuvée',
        message: `Votre demande de fonds de ${request.amount} FCFA a été approuvée`,
        recipient_id: request.requested_by,
        type: 'fund_request_approved',
        action_link: `/sfd/fund-requests/${requestId}`,
        sender_id: user?.id,
      });
      
      return request;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meref-fund-requests'] });
      toast({
        title: 'Demande approuvée',
        description: 'La demande de fonds a été approuvée avec succès',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de l\'approbation',
        variant: 'destructive',
      });
    },
  });
  
  // Reject a fund request (MEREF admin only)
  const rejectFundRequest = useMutation({
    mutationFn: async ({ requestId, comments }: { requestId: string; comments?: string }) => {
      const { data: request, error: requestError } = await supabase
        .from('meref_fund_requests')
        .update({
          status: 'rejected',
          approved_at: new Date().toISOString(), // Using same field for rejection timestamp
          approved_by: user?.id,
          comments,
        })
        .eq('id', requestId)
        .select()
        .single();
        
      if (requestError) throw requestError;
      
      // Create notification for the SFD
      await supabase.from('admin_notifications').insert({
        title: 'Demande de fonds rejetée',
        message: `Votre demande de fonds de ${request.amount} FCFA a été rejetée`,
        recipient_id: request.requested_by,
        type: 'fund_request_rejected',
        action_link: `/sfd/fund-requests/${requestId}`,
        sender_id: user?.id,
      });
      
      return request;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meref-fund-requests'] });
      toast({
        title: 'Demande rejetée',
        description: 'La demande de fonds a été rejetée',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors du rejet',
        variant: 'destructive',
      });
    },
  });
  
  // Execute fund transfer after approval (Credit SFD account)
  const executeFundTransfer = useMutation({
    mutationFn: async (requestId: string) => {
      // Call the edge function that will handle the fund transfer
      const { data, error } = await supabase.functions.invoke('meref-funding', {
        body: JSON.stringify({ 
          action: 'transfer', 
          requestId 
        }),
      });
        
      if (error) throw error;
      if (!data.success) throw new Error(data.message);
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['meref-fund-requests'] });
      queryClient.invalidateQueries({ queryKey: ['sfd-accounts'] }); // Refresh SFD account balances
      
      toast({
        title: 'Transfert effectué',
        description: `Les fonds de ${data.amount} FCFA ont été transférés au compte de la SFD`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur de transfert',
        description: error.message || 'Une erreur est survenue lors du transfert des fonds',
        variant: 'destructive',
      });
    },
  });
  
  return {
    fundRequests: fundRequests || [],
    isLoading,
    error,
    refetch,
    createFundRequest: createFundRequestMutation.mutate,
    isSubmitting: createFundRequestMutation.isPending,
    approveFundRequest,
    rejectFundRequest,
    executeFundTransfer,
  };
}
