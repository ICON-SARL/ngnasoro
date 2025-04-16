
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useVerificationDocuments(adhesionRequestId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: documents, isLoading } = useQuery({
    queryKey: ['verification-documents', adhesionRequestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('verification_documents')
        .select('*')
        .eq('adhesion_request_id', adhesionRequestId);

      if (error) throw error;
      return data;
    },
  });

  const verifyDocument = useMutation({
    mutationFn: async ({ 
      documentId, 
      status, 
      notes 
    }: { 
      documentId: string; 
      status: 'verified' | 'rejected'; 
      notes?: string; 
    }) => {
      const { data, error } = await supabase
        .from('verification_documents')
        .update({
          verification_status: status,
          verification_notes: notes,
          verified_at: new Date().toISOString(),
          verified_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', documentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification-documents'] });
      toast({
        title: "Document vérifié",
        description: "Le statut du document a été mis à jour avec succès."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: `Impossible de vérifier le document: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    documents,
    isLoading,
    verifyDocument
  };
}
