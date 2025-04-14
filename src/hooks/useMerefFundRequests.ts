
import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

// Définir l'interface MerefFundRequest pour qu'elle puisse être exportée et utilisée par d'autres composants
export interface MerefFundRequest {
  id: string;
  sfd_id: string;
  amount: number;
  purpose: string;
  justification: string;
  expected_impact?: string;
  region?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  credited_at?: string;
  decision_comments?: string;
  requested_by?: string;
  sfds?: {
    id: string;
    name: string;
    code: string;
  };
}

export interface FundRequestPayload {
  sfdId: string;
  amount: number;
  purpose: string;
  justification: string;
  expected_impact?: string;
  region?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export function useMerefFundRequests() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch fund requests for the current SFD
  const getFundRequests = async (sfdId: string) => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    const { data, error } = await supabase.functions.invoke('meref-fund-requests', {
      body: {
        action: 'list',
        sfdId
      }
    });

    if (error) throw error;
    return data || [];
  };

  // Query to fetch all fund requests (without sfdId filter)
  const getAllFundRequests = async () => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    const { data, error } = await supabase.functions.invoke('meref-fund-requests', {
      body: {
        action: 'list'
      }
    });

    if (error) throw error;
    return data || [];
  };

  // Query to fetch fund requests
  const fundRequestsQuery = (sfdId?: string) => {
    return useQuery({
      queryKey: ['meref-fund-requests', sfdId],
      queryFn: () => sfdId ? getFundRequests(sfdId) : getAllFundRequests(),
      enabled: !!user
    });
  };

  // Fetch all fund requests directly (for compatibility with existing components)
  const { data: fundRequests, isLoading, error, refetch } = useQuery({
    queryKey: ['meref-fund-requests', 'all'],
    queryFn: getAllFundRequests,
    enabled: !!user
  });

  // Mutation to create a new fund request
  const createFundRequest = useMutation({
    mutationFn: async (payload: FundRequestPayload) => {
      if (!user?.id) {
        throw new Error('User must be authenticated');
      }

      setIsSubmitting(true);
      try {
        const { data, error } = await supabase.functions.invoke('meref-fund-requests', {
          body: {
            action: 'create',
            fundRequest: {
              ...payload,
              userId: user.id
            }
          }
        });

        if (error) throw error;
        return data;
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meref-fund-requests'] });
      toast({
        title: 'Demande envoyée',
        description: 'Votre demande de financement a été envoyée avec succès',
      });
    },
    onError: (error: any) => {
      console.error('Error creating fund request:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de l\'envoi de la demande',
        variant: 'destructive',
      });
    }
  });

  // Approve a fund request (MEREF admin only)
  const approveFundRequest = useMutation({
    mutationFn: async ({ requestId, comments }: { requestId: string; comments?: string }) => {
      if (!user?.id) {
        throw new Error('User must be authenticated');
      }

      const { data, error } = await supabase.functions.invoke('meref-fund-requests', {
        body: {
          action: 'approve',
          requestId,
          adminId: user.id,
          comments
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meref-fund-requests'] });
      toast({
        title: 'Demande approuvée',
        description: 'La demande de financement a été approuvée avec succès',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de l\'approbation',
        variant: 'destructive',
      });
    }
  });

  // Reject a fund request (MEREF admin only)
  const rejectFundRequest = useMutation({
    mutationFn: async ({ requestId, comments }: { requestId: string; comments?: string }) => {
      if (!user?.id) {
        throw new Error('User must be authenticated');
      }

      const { data, error } = await supabase.functions.invoke('meref-fund-requests', {
        body: {
          action: 'reject',
          requestId,
          adminId: user.id,
          comments
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meref-fund-requests'] });
      toast({
        title: 'Demande rejetée',
        description: 'La demande de financement a été rejetée',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors du rejet',
        variant: 'destructive',
      });
    }
  });

  // Execute fund transfer after approval (Credit SFD account)
  const executeFundTransfer = useMutation({
    mutationFn: async (requestId: string) => {
      if (!user?.id) {
        throw new Error('User must be authenticated');
      }

      const { data, error } = await supabase.functions.invoke('meref-fund-requests', {
        body: {
          action: 'transfer',
          requestId,
          adminId: user.id
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meref-fund-requests'] });
      queryClient.invalidateQueries({ queryKey: ['sfd-accounts'] }); // Refresh SFD account balances

      toast({
        title: 'Transfert effectué',
        description: 'Les fonds ont été transférés au compte de la SFD',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur de transfert',
        description: error.message || 'Une erreur est survenue lors du transfert des fonds',
        variant: 'destructive',
      });
    }
  });

  return {
    // Nouvelle approche avec queries paramétrées
    fundRequestsQuery,
    createFundRequest,
    isSubmitting,
    
    // Pour maintenir la compatibilité avec les composants existants
    fundRequests: fundRequests as MerefFundRequest[] || [],
    isLoading,
    error,
    refetch,
    approveFundRequest,
    rejectFundRequest,
    executeFundTransfer
  };
}
