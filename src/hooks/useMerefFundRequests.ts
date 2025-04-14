
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { useSfdDataAccess } from './useSfdDataAccess';

export interface MerefFundRequest {
  id: string;
  sfd_id: string;
  amount: number;
  purpose: string;
  justification: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  region?: string;
  expected_impact?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  created_at: string;
  approved_at?: string;
  approved_by?: string;
  credited_at?: string;
  comments?: string;
  requested_by?: string;
}

type FundRequestProps = {
  amount: number;
  purpose: string;
  justification: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  region?: string;
  expected_impact?: string;
};

export function useMerefFundRequests() {
  const { user } = useAuth();
  const { activeSfdId } = useSfdDataAccess();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch fund requests for the active SFD
  const { data: fundRequests = [], isLoading, error, refetch } = useQuery({
    queryKey: ['meref-fund-requests', activeSfdId],
    queryFn: async () => {
      if (!activeSfdId) {
        console.log('No active SFD ID, cannot fetch fund requests');
        return [];
      }
      
      console.log(`Fetching fund requests for SFD ID: ${activeSfdId}`);
      
      try {
        const { data, error } = await supabase.functions.invoke('meref-fund-requests', {
          body: { 
            sfdId: activeSfdId,
            action: 'getFundRequests'
          }
        });
        
        if (error) {
          console.error('Error fetching fund requests from edge function:', error);
          throw error;
        }
        
        return data || [];
      } catch (err) {
        console.error('Error fetching fund requests:', err);
        throw err;
      }
    },
    enabled: !!activeSfdId,
    // Added for automatic refresh every 15 seconds
    refetchInterval: 15000,
    // Added to refresh on window focus
    refetchOnWindowFocus: true,
  });

  // Create fund request mutation
  const createFundRequest = useMutation({
    mutationFn: async (params: {
      sfdId: string;
      amount: number;
      purpose: string;
      justification: string;
      priority?: 'low' | 'normal' | 'high' | 'urgent';
      region?: string;
      expected_impact?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase.functions.invoke('meref-fund-requests', {
        body: {
          action: 'createFundRequest',
          sfdId: params.sfdId,
          fundRequest: {
            ...params,
            userId: user.id
          }
        }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Demande envoyée',
        description: 'Votre demande de financement MEREF a été envoyée avec succès',
      });
      queryClient.invalidateQueries({ queryKey: ['meref-fund-requests', activeSfdId] });
      
      // Explicitly refetch the data
      setTimeout(() => {
        refetch();
      }, 1000);
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: `Impossible d'envoyer la demande: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Approve a fund request (MEREF admin only)
  const approveFundRequest = useMutation({
    mutationFn: async ({ requestId, comments }: { requestId: string; comments?: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase.functions.invoke('process-subsidy-request', {
        body: {
          action: 'approve',
          requestId,
          data: { comments }
        }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Demande approuvée',
        description: 'La demande de financement a été approuvée avec succès',
      });
      queryClient.invalidateQueries({ queryKey: ['meref-fund-requests'] });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: `Impossible d'approuver la demande: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Reject a fund request (MEREF admin only)
  const rejectFundRequest = useMutation({
    mutationFn: async ({ requestId, comments }: { requestId: string; comments?: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase.functions.invoke('process-subsidy-request', {
        body: {
          action: 'reject',
          requestId,
          data: { comments }
        }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Demande rejetée',
        description: 'La demande de financement a été rejetée',
      });
      queryClient.invalidateQueries({ queryKey: ['meref-fund-requests'] });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: `Impossible de rejeter la demande: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Execute fund transfer after approval (Credit SFD account)
  const executeFundTransfer = useMutation({
    mutationFn: async (requestId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase.functions.invoke('meref-funding', {
        body: {
          action: 'transfer',
          requestId
        }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Transfert effectué',
        description: 'Les fonds ont été transférés avec succès au compte SFD',
      });
      queryClient.invalidateQueries({ queryKey: ['meref-fund-requests'] });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: `Impossible d'effectuer le transfert: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  return {
    fundRequests,
    isLoading,
    error,
    refetch,
    isSubmitting,
    createFundRequest,
    approveFundRequest,
    rejectFundRequest,
    executeFundTransfer
  };
}
