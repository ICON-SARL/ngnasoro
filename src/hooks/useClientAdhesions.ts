
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './auth/AuthContext';
import { useState } from 'react';

// Re-export the type for components that import from this file
export type AdhesionRequestInput = {
  full_name: string;
  email?: string;
  phone?: string;
  address?: string;
  id_number?: string;
  id_type?: string;
  profession?: string;
  monthly_income?: string;
  source_of_income?: string;
};

export function useClientAdhesions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreatingRequest, setIsCreatingRequest] = useState(false);

  // Récupérer toutes les demandes d'adhésion pour l'utilisateur actuel
  const { data: userAdhesionRequests, isLoading: isLoadingRequests } = useQuery({
    queryKey: ['user-adhesion-requests', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('client_adhesion_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  const submitAdhesionRequest = async (sfdId: string, data: AdhesionRequestInput) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour soumettre une demande",
        variant: "destructive",
      });
      return { success: false };
    }
    
    setIsCreatingRequest(true);
    
    try {
      const adhesionData = {
        user_id: user.id,
        sfd_id: sfdId,
        full_name: data.full_name,
        email: data.email || user.email,
        phone: data.phone,
        address: data.address,
        id_number: data.id_number,
        id_type: data.id_type,
        profession: data.profession,
        monthly_income: data.monthly_income ? parseFloat(data.monthly_income) : undefined,
        source_of_income: data.source_of_income,
        status: 'pending',
        reference_number: `ADH-${Date.now().toString().substring(6)}`
      };
      
      // Utiliser la fonction Edge pour créer une demande d'adhésion
      const { data: result, error } = await supabase.functions.invoke('process-client-adhesion', {
        body: JSON.stringify({
          userId: user.id,
          sfdId: sfdId,
          adhesionData
        })
      });
      
      if (error) throw error;
      
      toast({
        title: "Demande envoyée",
        description: "Votre demande d'adhésion a été envoyée avec succès",
      });
      
      // Invalider et refetch les requêtes
      queryClient.invalidateQueries({ queryKey: ['user-adhesion-requests'] });
      
      return { success: true, requestId: result?.requestId };
    } catch (error: any) {
      console.error('Error creating adhesion request:', error);
      
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'envoi de la demande",
        variant: "destructive",
      });
      
      return { success: false, error: error.message };
    } finally {
      setIsCreatingRequest(false);
    }
  };

  // Vérifier le statut d'une demande d'adhésion
  const checkAdhesionStatus = async () => {
    if (!user) return null;
    
    try {
      // Vérifier d'abord si l'utilisateur a déjà le rôle client
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'client' as any); // Type assertion to bypass type checking
        
      if (!rolesError && userRoles && userRoles.length > 0) {
        return { isClient: true, status: 'approved' };
      }

      // Sinon, vérifier les demandes d'adhésion
      const { data, error } = await supabase
        .from('client_adhesion_requests')
        .select(`
          *,
          sfds:sfd_id(name, logo_url)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        return { 
          isClient: data[0].status === 'approved',
          status: data[0].status,
          requestId: data[0].id,
          sfdId: data[0].sfd_id
        };
      }
      
      return { isClient: false, status: 'none' };
    } catch (error) {
      console.error('Error checking adhesion status:', error);
      return { isClient: false, status: 'error', error };
    }
  };

  return {
    submitAdhesionRequest,
    isCreatingRequest,
    userAdhesionRequests,
    isLoadingRequests,
    checkAdhesionStatus
  };
}
