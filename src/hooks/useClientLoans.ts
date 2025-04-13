
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loan } from '@/types/sfdClients';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface LoanApplication {
  sfd_id: string;
  amount: number;
  duration_months: number;
  purpose: string;
  supporting_documents?: string[];
  interest_rate?: number;
}

export function useClientLoans() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  
  // Fetch client loans
  const loansQuery = useQuery({
    queryKey: ['client-loans', user?.id],
    queryFn: async (): Promise<Loan[]> => {
      if (!user?.id) return [];
      
      // Pour cette démo, nous allons retourner des données fictives
      // Dans une implémentation réelle, vous connecteriez cela à votre API
      return [
        {
          id: '1',
          client_id: user.id,
          sfd_id: 'sfd1',
          amount: 25400,
          duration_months: 6,
          interest_rate: 5,
          monthly_payment: 4400,
          purpose: 'Financement équipement agricole',
          status: 'active',
          created_at: '2023-06-05T10:00:00Z',
          disbursed_at: '2023-06-10T10:00:00Z',
          next_payment_date: '2023-07-10T10:00:00Z'
        },
        {
          id: '2',
          client_id: user.id,
          sfd_id: 'sfd2',
          amount: 15500,
          duration_months: 3,
          interest_rate: 4,
          monthly_payment: 5300,
          purpose: 'Fonds de roulement',
          status: 'completed',
          created_at: '2023-05-10T10:00:00Z',
          disbursed_at: '2023-05-15T10:00:00Z'
        },
        {
          id: '3',
          client_id: user.id,
          sfd_id: 'sfd3',
          amount: 5800,
          duration_months: 2,
          interest_rate: 3.5,
          monthly_payment: 2950,
          purpose: 'Achat de semences',
          status: 'pending',
          created_at: '2023-07-01T10:00:00Z'
        }
      ];
    },
    enabled: !!user?.id
  });
  
  // Apply for a loan
  const applyForLoan = useMutation({
    mutationFn: async (application: LoanApplication) => {
      if (!user?.id) throw new Error("Utilisateur non authentifié");
      
      setIsUploading(true);
      
      try {
        // Dans une implémentation réelle, vous appelleriez votre API ici
        // Pour cette démo, nous simulons une attente puis retournons une réponse réussie
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const newLoan: Loan = {
          id: `loan-${Date.now()}`,
          client_id: user.id,
          sfd_id: application.sfd_id,
          amount: application.amount,
          duration_months: application.duration_months,
          interest_rate: application.interest_rate || 5,
          monthly_payment: application.amount / application.duration_months * 1.05, // Simplification
          purpose: application.purpose,
          status: 'pending',
          created_at: new Date().toISOString()
        };
        
        return newLoan;
      } finally {
        setIsUploading(false);
      }
    },
    onSuccess: () => {
      toast({
        title: "Demande envoyée",
        description: "Votre demande de prêt a été envoyée avec succès. Vous recevrez une notification dès qu'elle sera traitée.",
      });
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
    loans: loansQuery.data || [],
    isLoading: loansQuery.isLoading,
    isUploading,
    applyForLoan,
    refetchLoans: loansQuery.refetch
  };
}
