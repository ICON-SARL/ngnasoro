
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface AdhesionFormData {
  full_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  profession?: string;
  monthly_income?: string;
  source_of_income?: string;
}

export function useSfdAdhesionRequests() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fonction pour soumettre une demande d'adhésion
  const submitAdhesionRequest = async (sfdId: string, formData?: AdhesionFormData) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour soumettre une demande d'adhésion",
        variant: "destructive",
      });
      return { success: false };
    }

    try {
      setIsSubmitting(true);

      const response = await supabase.functions.invoke('process-client-adhesion', {
        body: { 
          userId: user.id, 
          sfdId, 
          adhesionData: formData
        }
      });

      if (response.error) {
        console.error("Erreur lors de la soumission de la demande d'adhésion:", response.error);
        toast({
          title: "Erreur",
          description: response.error.message || "Échec de la demande d'adhésion",
          variant: "destructive",
        });
        return { success: false };
      }

      const data = response.data;

      if (!data.success) {
        toast({
          title: "Information",
          description: data.message,
          variant: "default",
        });
        return { success: false, message: data.message };
      }

      toast({
        title: "Demande envoyée",
        description: data.message,
      });

      return { success: true, requestId: data.requestId };
    } catch (error: any) {
      console.error("Erreur lors de la soumission de la demande d'adhésion:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la demande d'adhésion",
        variant: "destructive",
      });
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction pour traiter une demande d'adhésion (approuver/rejeter)
  const processAdhesionRequest = async (
    requestId: string, 
    action: 'approve' | 'reject', 
    notes?: string
  ) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour traiter cette demande",
        variant: "destructive",
      });
      return { success: false };
    }

    try {
      setIsProcessing(true);

      const response = await supabase.functions.invoke('manage-adhesion-request', {
        body: { 
          requestId, 
          action, 
          adminId: user.id,
          notes
        }
      });

      if (response.error) {
        console.error("Erreur lors du traitement de la demande d'adhésion:", response.error);
        toast({
          title: "Erreur",
          description: response.error.message || `Échec de l'${action === 'approve' ? 'approbation' : 'rejet'}`,
          variant: "destructive",
        });
        return { success: false };
      }

      const data = response.data;

      toast({
        title: action === 'approve' ? "Demande approuvée" : "Demande rejetée",
        description: data.message,
        variant: action === 'approve' ? "default" : "destructive",
      });

      return { 
        success: true, 
        status: data.status,
        clientId: data.clientId
      };
    } catch (error: any) {
      console.error("Erreur lors du traitement de la demande d'adhésion:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
      return { success: false };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    submitAdhesionRequest,
    processAdhesionRequest,
    isSubmitting,
    isProcessing
  };
}
