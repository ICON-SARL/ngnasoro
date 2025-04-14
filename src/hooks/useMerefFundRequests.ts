
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MerefFundRequest {
  sfdId: string;
  amount: number;
  purpose: string;
  justification: string;
}

export function useMerefFundRequests() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // Mock fund requests data for development
  const mockFundRequests = [
    {
      id: '1',
      sfd_id: 'sfd-123',
      amount: 1000000,
      purpose: 'Expansion des services financiers',
      justification: 'Permettre d\'atteindre les zones rurales avec des services financiers de base',
      status: 'pending',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      sfd_id: 'sfd-456',
      amount: 500000,
      purpose: 'Digitalisation des services',
      justification: 'Modernisation des processus pour améliorer l\'efficacité opérationnelle',
      status: 'approved',
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      approved_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
  
  const createFundRequest = async (request: MerefFundRequest) => {
    try {
      setIsSubmitting(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Utilisateur non authentifié');
      }
      
      // Submit request to the database
      const { data, error } = await supabase
        .from('subsidy_requests')
        .insert({
          sfd_id: request.sfdId,
          amount: request.amount,
          purpose: request.purpose,
          justification: request.justification,
          requested_by: user.id,
          status: 'pending',
          priority: 'normal'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: 'Demande envoyée',
        description: 'Votre demande de financement a été envoyée avec succès',
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de l\'envoi de la demande',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Stub functions for the admin features
  const approveFundRequest = async ({ requestId, comments }: { requestId: string; comments?: string }) => {
    // Placeholder for approval functionality
    return { success: true };
  };
  
  const rejectFundRequest = async ({ requestId, comments }: { requestId: string; comments?: string }) => {
    // Placeholder for rejection functionality
    return { success: true };
  };
  
  const executeFundTransfer = async (requestId: string) => {
    // Placeholder for fund transfer functionality
    return { success: true };
  };
  
  // Adding the missing properties to the return object
  return {
    createFundRequest,
    isSubmitting,
    // Add the missing properties
    fundRequests: mockFundRequests,
    isLoading: false,
    refetch: () => Promise.resolve(),
    approveFundRequest: { mutate: approveFundRequest, isPending: false },
    rejectFundRequest: { mutate: rejectFundRequest, isPending: false },
    executeFundTransfer: { mutate: executeFundTransfer, isPending: false }
  };
}
