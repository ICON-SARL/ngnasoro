
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
  requested_by?: string;
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
  
  // Mock data for development purposes since the table doesn't exist yet
  const mockFundRequests: MerefFundRequest[] = [
    {
      id: '1',
      sfd_id: 'sfd-123',
      amount: 1000000,
      purpose: 'Expansion des services financiers',
      justification: 'Permettre d\'atteindre les zones rurales avec des services financiers de base',
      status: 'pending',
      created_at: new Date().toISOString(),
      requested_by: user?.id
    },
    {
      id: '2',
      sfd_id: 'sfd-456',
      amount: 500000,
      purpose: 'Digitalisation des services',
      justification: 'Modernisation des processus pour améliorer l\'efficacité opérationnelle',
      status: 'approved',
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      approved_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      approved_by: 'admin-123',
      requested_by: user?.id
    }
  ];
  
  // Fetch all fund requests - using mock data until the table exists
  const { data: fundRequests, isLoading, error, refetch } = useQuery({
    queryKey: ['meref-fund-requests'],
    queryFn: async () => {
      // In a real implementation, we'd use:
      // const { data, error } = await supabase.from('meref_fund_requests').select('*').order('created_at', { ascending: false });
      // if (error) throw error;
      // return data as MerefFundRequest[];
      
      // For now, return mock data
      return mockFundRequests;
    },
    enabled: !!user,
  });
  
  // Create a new fund request
  const createFundRequestMutation = useMutation({
    mutationFn: async (formData: FundRequestFormData) => {
      // In a real implementation with the actual table:
      /*
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
      */
      
      // For now, simulate a successful creation
      const newRequest: MerefFundRequest = {
        id: `mock-${Date.now()}`,
        sfd_id: formData.sfdId,
        amount: formData.amount,
        purpose: formData.purpose,
        justification: formData.justification,
        status: 'pending',
        created_at: new Date().toISOString(),
        requested_by: user?.id
      };
      
      // Simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return newRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meref-fund-requests'] });
    },
  });
  
  // Approve a fund request (MEREF admin only)
  const approveFundRequest = useMutation({
    mutationFn: async ({ requestId, comments }: { requestId: string; comments?: string }) => {
      // In a real implementation
      /*
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
      */
      
      // For now, return a mock approved request
      const approvedRequest = mockFundRequests.find(req => req.id === requestId);
      if (!approvedRequest) throw new Error('Demande non trouvée');
      
      const updatedRequest = {
        ...approvedRequest,
        status: 'approved' as const,
        approved_at: new Date().toISOString(),
        approved_by: user?.id,
        comments
      };
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return updatedRequest;
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
      // Similar to approve, but with 'rejected' status
      // Using mock data for now
      const rejectedRequest = mockFundRequests.find(req => req.id === requestId);
      if (!rejectedRequest) throw new Error('Demande non trouvée');
      
      const updatedRequest = {
        ...rejectedRequest,
        status: 'rejected' as const,
        approved_at: new Date().toISOString(), // Using same field for rejection timestamp
        approved_by: user?.id,
        comments
      };
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return updatedRequest;
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
      // In a real implementation, we'd call the edge function
      /*
      const { data, error } = await supabase.functions.invoke('meref-funding', {
        body: JSON.stringify({ 
          action: 'transfer', 
          requestId 
        }),
      });
      
      if (error) throw error;
      if (!data.success) throw new Error(data.message);
      
      return data;
      */
      
      // For now, simulate a successful transfer
      const request = mockFundRequests.find(req => req.id === requestId);
      if (!request) throw new Error('Demande non trouvée');
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return {
        success: true,
        message: 'Les fonds ont été transférés avec succès',
        amount: request.amount,
        sfdId: request.sfd_id
      };
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
