
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { useSfdDataAccess } from './useSfdDataAccess';

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
  const { data: fundRequests = [], isLoading, error } = useQuery({
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
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: `Impossible d'envoyer la demande: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  return {
    fundRequests,
    isLoading,
    error,
    isSubmitting,
    createFundRequest
  };
}
