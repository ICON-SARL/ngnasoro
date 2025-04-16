
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export function useClientAdhesions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Récupérer les demandes d'adhésion de l'utilisateur
  const {
    data: userAdhesionRequests = [],
    isLoading: isLoadingUserAdhesionRequests,
    refetch: refetchUserAdhesionRequests
  } = useQuery({
    queryKey: ['adhesion-requests', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('client_adhesion_requests')
        .select('*, sfds(name, logo_url)')
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      return data || [];
    },
    enabled: !!user?.id
  });

  // Mutation pour soumettre une nouvelle demande
  const submitAdhesionRequest = useMutation({
    mutationFn: async (data: {
      sfdId: string;
      fullName: string;
      email?: string;
      phone?: string;
    }) => {
      const { data: result, error } = await supabase
        .from('client_adhesion_requests')
        .insert({
          sfd_id: data.sfdId,
          user_id: user?.id,
          full_name: data.fullName,
          email: data.email,
          phone: data.phone,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Demande envoyée",
        description: "Votre demande d'adhésion a été soumise avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['adhesion-requests'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer votre demande: " + error.message,
        variant: "destructive",
      });
    }
  });

  return {
    userAdhesionRequests,
    isLoadingUserAdhesionRequests,
    refetchUserAdhesionRequests,
    submitAdhesionRequest
  };
}
