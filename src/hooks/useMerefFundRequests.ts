
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MerefFundRequest {
  sfdId: string;
  amount: number;
  purpose: string;
  justification: string;
}

export function useMerefFundRequests() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
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
  
  return {
    createFundRequest,
    isSubmitting,
  };
}
