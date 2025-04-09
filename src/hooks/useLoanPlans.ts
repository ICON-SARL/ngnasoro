
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth';
import { useToast } from '@/hooks/use-toast';

export function useLoanPlans() {
  const { activeSfdId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get all loan plans for the current SFD
  const fetchLoanPlans = async () => {
    if (!activeSfdId) return [];
    
    const { data, error } = await supabase
      .from('sfd_loan_plans')
      .select('*')
      .eq('sfd_id', activeSfdId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching loan plans:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les plans de prêt",
        variant: "destructive"
      });
      return [];
    }
    
    return data || [];
  };
  
  const { data: loanPlans = [], isLoading, isError } = useQuery({
    queryKey: ['loan-plans', activeSfdId],
    queryFn: fetchLoanPlans,
    enabled: !!activeSfdId
  });
  
  // Create a new loan plan
  const createLoanPlan = useMutation({
    mutationFn: async (planData: {
      name: string;
      description?: string;
      min_amount: number;
      max_amount: number;
      min_duration: number;
      max_duration: number;
      interest_rate: number;
      fees: number;
      is_active: boolean;
      requirements?: string[];
      sfd_id: string;
    }) => {
      const { data, error } = await supabase
        .from('sfd_loan_plans')
        .insert(planData)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loan-plans', activeSfdId] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Impossible de créer le plan de prêt: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Update an existing loan plan
  const updateLoanPlan = useMutation({
    mutationFn: async (planData: {
      id: string;
      name: string;
      description?: string;
      min_amount: number;
      max_amount: number;
      min_duration: number;
      max_duration: number;
      interest_rate: number;
      fees: number;
      is_active: boolean;
      requirements?: string[];
    }) => {
      const { id, ...updateData } = planData;
      
      const { data, error } = await supabase
        .from('sfd_loan_plans')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loan-plans', activeSfdId] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Impossible de mettre à jour le plan de prêt: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Delete a loan plan
  const deleteLoanPlan = useMutation({
    mutationFn: async ({ planId }: { planId: string }) => {
      const { error } = await supabase
        .from('sfd_loan_plans')
        .delete()
        .eq('id', planId);
        
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loan-plans', activeSfdId] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Impossible de supprimer le plan de prêt: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  return {
    loanPlans,
    isLoading,
    isError,
    createLoanPlan,
    updateLoanPlan,
    deleteLoanPlan
  };
}
