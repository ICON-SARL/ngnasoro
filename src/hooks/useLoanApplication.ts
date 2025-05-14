
import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { LoanApplication } from '@/types/loans';

export function useLoanApplication(sfdId?: string) {
  const { user } = useAuth();
  const [loanPlans, setLoanPlans] = useState<any[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Fetch loan plans for the SFD
  useEffect(() => {
    const fetchLoanPlans = async () => {
      if (!sfdId && !user) return;
      
      setIsLoadingPlans(true);
      try {
        const { data, error } = await supabase
          .from('sfd_loan_plans')
          .select(`
            *,
            sfds:sfd_id (name, logo_url)
          `)
          .eq(sfdId ? 'sfd_id' : 'is_published', sfdId || true)
          .eq('is_active', true)
          .order('name');
          
        if (error) throw error;
        setLoanPlans(data || []);
      } catch (err) {
        console.error("Error fetching loan plans:", err);
        setLoanPlans([]);
      } finally {
        setIsLoadingPlans(false);
      }
    };
    
    fetchLoanPlans();
  }, [sfdId, user]);
  
  // Submit loan application mutation
  const submitMutation = useMutation({
    mutationFn: async (loanData: LoanApplication) => {
      try {
        setIsUploading(true);
        
        // First get the client ID
        const { data: clientData, error: clientError } = await supabase
          .from('sfd_clients')
          .select('id')
          .eq('user_id', user?.id)
          .eq('sfd_id', loanData.sfd_id)
          .maybeSingle();
        
        if (clientError) throw clientError;
        
        if (!clientData) {
          throw new Error("Vous n'êtes pas enregistré comme client de cette SFD");
        }
        
        // Calculate monthly payment (simple formula for demo)
        const monthlyRate = (loanData.interest_rate || 5) / 100 / 12;
        const monthlyPayment = 
          (loanData.amount * monthlyRate * Math.pow(1 + monthlyRate, loanData.duration_months)) / 
          (Math.pow(1 + monthlyRate, loanData.duration_months) - 1);
        
        // Create the loan
        const { data, error } = await supabase
          .from('sfd_loans')
          .insert({
            client_id: clientData.id,
            sfd_id: loanData.sfd_id,
            loan_plan_id: loanData.loan_plan_id,
            amount: loanData.amount,
            duration_months: loanData.duration_months,
            interest_rate: loanData.interest_rate || 5,
            purpose: loanData.purpose,
            status: 'pending',
            monthly_payment: monthlyPayment
          })
          .select()
          .single();
          
        if (error) throw error;
        
        return { success: true, data };
      } catch (error: any) {
        console.error("Error submitting loan application:", error);
        return { success: false, error: error.message };
      } finally {
        setIsUploading(false);
      }
    }
  });
  
  const submitApplication = async (loanData: LoanApplication) => {
    return submitMutation.mutateAsync(loanData);
  };
  
  return {
    loanPlans,
    isLoadingPlans,
    isUploading: isUploading || submitMutation.isPending,
    submitApplication
  };
}
