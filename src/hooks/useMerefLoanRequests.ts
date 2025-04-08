
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MerefLoanRequest, LoanDocument, MerefRequestActivity } from "@/types/merefLoanRequest";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export function useMerefLoanRequests(sfdId?: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Récupérer toutes les demandes de prêt MEREF pour une SFD
  const getLoanRequests = useQuery({
    queryKey: ['meref-loan-requests', sfdId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meref_loan_requests')
        .select(`
          *,
          meref_request_documents(*)
        `)
        .eq('sfd_id', sfdId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data;
    },
    enabled: !!sfdId
  });
  
  // Récupérer une demande de prêt MEREF spécifique
  const getLoanRequest = (requestId: string) => {
    return useQuery({
      queryKey: ['meref-loan-request', requestId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('meref_loan_requests')
          .select(`
            *,
            meref_request_documents(*),
            meref_request_activities(*),
            sfd_clients(id, full_name, email, phone)
          `)
          .eq('id', requestId)
          .single();
          
        if (error) throw error;
        return data;
      },
      enabled: !!requestId
    });
  };
  
  // Créer une nouvelle demande de prêt
  const createLoanRequest = useMutation({
    mutationFn: async (loanRequest: Omit<MerefLoanRequest, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('meref_loan_requests')
        .insert({
          ...loanRequest,
          created_by: user?.id || loanRequest.created_by
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meref-loan-requests'] });
      toast({
        title: "Demande créée",
        description: "La demande de prêt a été créée avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la création de la demande: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Mettre à jour une demande de prêt
  const updateLoanRequest = useMutation({
    mutationFn: async ({ id, ...data }: MerefLoanRequest) => {
      const { data: updatedData, error } = await supabase
        .from('meref_loan_requests')
        .update({ 
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      // Enregistrer l'activité
      await supabase
        .from('meref_request_activities')
        .insert({
          request_id: id,
          activity_type: 'update',
          description: 'Mise à jour de la demande',
          performed_by: user?.id
        });
        
      return updatedData;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['meref-loan-requests'] });
      queryClient.invalidateQueries({ queryKey: ['meref-loan-request', data.id] });
      toast({
        title: "Demande mise à jour",
        description: "La demande de prêt a été mise à jour avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la mise à jour de la demande: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Soumettre une demande pour approbation interne
  const submitLoanRequest = useMutation({
    mutationFn: async (requestId: string) => {
      const { data, error } = await supabase
        .from('meref_loan_requests')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select()
        .single();
        
      if (error) throw error;
      
      // Enregistrer l'activité
      await supabase
        .from('meref_request_activities')
        .insert({
          request_id: requestId,
          activity_type: 'submit',
          description: 'Demande soumise pour approbation interne',
          performed_by: user?.id
        });
        
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['meref-loan-requests'] });
      queryClient.invalidateQueries({ queryKey: ['meref-loan-request', data.id] });
      toast({
        title: "Demande soumise",
        description: "La demande a été soumise pour approbation interne",
      });
    }
  });
  
  // Approuver une demande en interne
  const approveLoanRequest = useMutation({
    mutationFn: async (requestId: string) => {
      const { data, error } = await supabase
        .from('meref_loan_requests')
        .update({
          status: 'approved_internal',
          approved_at: new Date().toISOString(),
          approved_by: user?.id
        })
        .eq('id', requestId)
        .select()
        .single();
        
      if (error) throw error;
      
      // Enregistrer l'activité
      await supabase
        .from('meref_request_activities')
        .insert({
          request_id: requestId,
          activity_type: 'approve_internal',
          description: 'Demande approuvée en interne',
          performed_by: user?.id
        });
        
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['meref-loan-requests'] });
      queryClient.invalidateQueries({ queryKey: ['meref-loan-request', data.id] });
      toast({
        title: "Demande approuvée",
        description: "La demande a été approuvée en interne",
      });
    }
  });
  
  // Rejeter une demande en interne
  const rejectLoanRequest = useMutation({
    mutationFn: async ({ requestId, reason }: { requestId: string, reason: string }) => {
      const { data, error } = await supabase
        .from('meref_loan_requests')
        .update({
          status: 'rejected_internal',
          rejection_reason: reason
        })
        .eq('id', requestId)
        .select()
        .single();
        
      if (error) throw error;
      
      // Enregistrer l'activité
      await supabase
        .from('meref_request_activities')
        .insert({
          request_id: requestId,
          activity_type: 'reject_internal',
          description: 'Demande rejetée en interne',
          details: { reason },
          performed_by: user?.id
        });
        
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['meref-loan-requests'] });
      queryClient.invalidateQueries({ queryKey: ['meref-loan-request', data.id] });
      toast({
        title: "Demande rejetée",
        description: "La demande a été rejetée",
      });
    }
  });
  
  // Soumettre une demande au MEREF
  const submitToMeref = useMutation({
    mutationFn: async (requestId: string) => {
      // D'abord, mettre à jour le statut de la demande
      const { data, error } = await supabase
        .from('meref_loan_requests')
        .update({
          status: 'meref_submitted',
          meref_submitted_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select()
        .single();
        
      if (error) throw error;
      
      // Enregistrer l'activité
      await supabase
        .from('meref_request_activities')
        .insert({
          request_id: requestId,
          activity_type: 'submit_to_meref',
          description: 'Demande soumise au MEREF',
          performed_by: user?.id
        });

      // À IMPLÉMENTER: Appel API au système MEREF
      // Ceci est une simulation pour le moment
      console.log("Simulation: Envoi de la demande au MEREF");
        
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['meref-loan-requests'] });
      queryClient.invalidateQueries({ queryKey: ['meref-loan-request', data.id] });
      toast({
        title: "Demande envoyée au MEREF",
        description: "La demande a été soumise avec succès au MEREF",
      });
    }
  });
  
  // Télécharger un document pour une demande
  const uploadDocument = useMutation({
    mutationFn: async ({ requestId, file, documentType }: { 
      requestId: string, 
      file: File, 
      documentType: DocumentType 
    }) => {
      // Générer un chemin de stockage unique
      const filePath = `meref-documents/${requestId}/${Date.now()}-${file.name}`;
      
      // Télécharger le fichier vers le stockage Supabase
      const { data: fileData, error: uploadError } = await supabase
        .storage
        .from('loan-documents')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Obtenir l'URL publique du fichier
      const { data: urlData } = await supabase
        .storage
        .from('loan-documents')
        .getPublicUrl(filePath);
        
      const publicUrl = urlData.publicUrl;
      
      // Enregistrer les métadonnées du document dans la base de données
      const { data, error } = await supabase
        .from('meref_request_documents')
        .insert({
          request_id: requestId,
          document_type: documentType,
          document_url: publicUrl,
          filename: file.name,
          uploaded_by: user?.id
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Enregistrer l'activité
      await supabase
        .from('meref_request_activities')
        .insert({
          request_id: requestId,
          activity_type: 'upload_document',
          description: `Document téléchargé: ${file.name}`,
          details: { document_type: documentType },
          performed_by: user?.id
        });
        
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['meref-loan-request', variables.requestId] });
      toast({
        title: "Document téléchargé",
        description: "Le document a été téléchargé avec succès",
      });
    }
  });
  
  // Vérifier un document
  const verifyDocument = useMutation({
    mutationFn: async ({ documentId, verified }: { documentId: string, verified: boolean }) => {
      const { data, error } = await supabase
        .from('meref_request_documents')
        .update({
          verified,
          verified_by: user?.id,
          verified_at: new Date().toISOString()
        })
        .eq('id', documentId)
        .select()
        .single();
        
      if (error) throw error;
      
      // Enregistrer l'activité
      await supabase
        .from('meref_request_activities')
        .insert({
          request_id: data.request_id,
          activity_type: verified ? 'verify_document' : 'reject_document',
          description: verified ? 'Document vérifié' : 'Document rejeté',
          details: { document_id: documentId },
          performed_by: user?.id
        });
        
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['meref-loan-request', data.request_id] });
      toast({
        title: "Document mis à jour",
        description: "Le statut du document a été mis à jour",
      });
    }
  });
  
  return {
    getLoanRequests,
    getLoanRequest,
    createLoanRequest,
    updateLoanRequest,
    submitLoanRequest,
    approveLoanRequest,
    rejectLoanRequest,
    submitToMeref,
    uploadDocument,
    verifyDocument
  };
}
