
import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface FundRequestPayload {
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

  // Query to fetch fund requests
  const fundRequestsQuery = (sfdId?: string) => {
    return useQuery({
      queryKey: ['meref-fund-requests', sfdId],
      queryFn: () => sfdId ? getFundRequests(sfdId) : Promise.resolve([]),
      enabled: !!sfdId && !!user
    });
  };

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

  return {
    fundRequestsQuery,
    createFundRequest,
    isSubmitting
  };
}
