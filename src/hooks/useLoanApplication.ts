
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export type LoanDocumentType = 'id_card' | 'proof_of_income' | 'bank_statement' | 'business_plan';

export type LoanApplication = {
  amount: number;
  duration_months: number;
  purpose: string;
  loan_plan_id: string;
  documents?: {
    type: LoanDocumentType;
    file: File;
  }[];
};

export const useLoanApplication = (sfdId?: string) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

  // Fetch available loan plans
  const loanPlansQuery = useQuery({
    queryKey: ['loan-plans', sfdId],
    queryFn: async () => {
      if (!sfdId) return [];
      
      const { data, error } = await supabase
        .from('sfd_loan_plans')
        .select('*')
        .eq('sfd_id', sfdId)
        .eq('is_active', true)
        .order('min_amount');
        
      if (error) throw error;
      return data;
    },
    enabled: !!sfdId
  });

  // Upload loan document
  const uploadDocument = async (file: File, loanId: string, type: LoanDocumentType) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${loanId}/${type}-${Date.now()}.${fileExt}`;
    const filePath = `loan-documents/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('loan-documents')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('loan-documents')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  // Submit loan application
  const submitApplication = useMutation({
    mutationFn: async (application: LoanApplication) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      setIsUploading(true);
      try {
        // Get client ID
        const { data: clientData, error: clientError } = await supabase
          .from('sfd_clients')
          .select('id')
          .eq('user_id', user.id)
          .eq('sfd_id', sfdId)
          .single();

        if (clientError) throw clientError;
        
        // Get selected loan plan to determine interest rate
        const { data: loanPlan, error: loanPlanError } = await supabase
          .from('sfd_loan_plans')
          .select('interest_rate, fees')
          .eq('id', application.loan_plan_id)
          .single();
          
        if (loanPlanError) throw loanPlanError;
        
        // Calculate monthly payment
        const monthlyInterestRate = loanPlan.interest_rate / 100 / 12;
        const totalMonths = application.duration_months;
        // Calculate monthly payment using standard amortization formula
        const monthlyPayment = (application.amount * monthlyInterestRate * 
          Math.pow(1 + monthlyInterestRate, totalMonths)) / 
          (Math.pow(1 + monthlyInterestRate, totalMonths) - 1);

        // Create loan record
        const { data: loan, error: loanError } = await supabase
          .from('sfd_loans')
          .insert({
            client_id: clientData.id,
            sfd_id: sfdId,
            amount: application.amount,
            duration_months: application.duration_months,
            purpose: application.purpose,
            loan_plan_id: application.loan_plan_id,
            interest_rate: loanPlan.interest_rate,
            monthly_payment: Math.round(monthlyPayment),
            status: 'pending'
          })
          .select()
          .single();

        if (loanError) throw loanError;

        // Upload documents if provided
        if (application.documents?.length) {
          const documentPromises = application.documents.map(async (doc) => {
            const publicUrl = await uploadDocument(doc.file, loan.id, doc.type);
            
            return supabase.from('loan_documents').insert({
              loan_id: loan.id,
              document_type: doc.type,
              document_url: publicUrl,
              uploaded_by: user.id
            });
          });

          await Promise.all(documentPromises);
        }

        return loan;
      } finally {
        setIsUploading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-loans'] });
      toast({
        title: "Demande envoyée",
        description: "Votre demande de prêt a été soumise avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'envoi de votre demande",
        variant: "destructive",
      });
    }
  });

  return {
    loanPlans: loanPlansQuery.data || [],
    isLoadingPlans: loanPlansQuery.isLoading,
    isUploading,
    submitApplication,
  };
};
