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
  sfd_id: string;
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
        // Get client ID first
        const { data: clientData, error: clientError } = await supabase
          .from('sfd_clients')
          .select('id')
          .eq('user_id', user.id)
          .eq('sfd_id', application.sfd_id)
          .maybeSingle();

        if (clientError) {
          console.error('Error fetching client:', clientError);
          throw new Error(`Erreur lors de la récupération des informations client: ${clientError.message}`);
        }
        
        if (!clientData) {
          // If no client record exists, create an adhesion request
          throw new Error(`Vous n'êtes pas encore client de cette SFD. Veuillez d'abord soumettre une demande d'adhésion.`);
        }
        
        // Get selected loan plan to determine interest rate
        const { data: loanPlan, error: loanPlanError } = await supabase
          .from('sfd_loan_plans')
          .select('interest_rate')
          .eq('id', application.loan_plan_id)
          .single();
          
        if (loanPlanError) {
          // If no specific loan plan, use default values
          console.warn('Using default loan plan values:', loanPlanError);
        }
        
        // Use loan plan rates or defaults
        const interestRate = loanPlan?.interest_rate || 5.5;
        
        // Calculate monthly payment
        const monthlyInterestRate = interestRate / 100 / 12;
        const totalMonths = application.duration_months;
        const monthlyPayment = (application.amount * monthlyInterestRate * 
          Math.pow(1 + monthlyInterestRate, totalMonths)) / 
          (Math.pow(1 + monthlyInterestRate, totalMonths) - 1);

        // Create loan record via edge function to bypass RLS
        const { data: loan, error: functionError } = await supabase.functions
          .invoke('loan-manager', {
            body: {
              action: 'create_loan',
              data: {
                client_id: clientData.id,
                sfd_id: application.sfd_id,
                amount: application.amount,
                duration_months: application.duration_months,
                purpose: application.purpose,
                loan_plan_id: application.loan_plan_id,
                interest_rate: interestRate,
                monthly_payment: Math.round(monthlyPayment),
                status: 'pending'
              }
            }
          });

        if (functionError) {
          console.error('Error creating loan via function:', functionError);
          throw new Error('Erreur lors de la création du prêt. Veuillez réessayer.');
        }
        
        if (!loan?.id) {
          throw new Error('Erreur lors de la création du prêt. Aucun identifiant retourné.');
        }

        // Upload documents if provided (using client_documents table)
        if (application.documents?.length) {
          for (const doc of application.documents) {
            const publicUrl = await uploadDocument(doc.file, loan.id, doc.type);
            
            await supabase.from('client_documents').insert({
              client_id: clientData.id,
              document_type: doc.type as any,
              document_url: publicUrl,
              uploaded_by: user.id
            });
          }
        }

        return loan;
      } catch (error: any) {
        console.error('Error submitting loan application:', error);
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-loans'] });
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
    loanPlans: loanPlansQuery?.data || [],
    isLoadingPlans: loanPlansQuery?.isLoading,
    isUploading,
    submitApplication
  };
};
