
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ClientAdhesionRequest } from '@/types/adhesionTypes';
import { useAuth } from '@/hooks/useAuth';

export interface AdhesionRequestInput {
  full_name: string;
  profession: string;
  monthly_income: string;
  source_of_income: string;
  phone: string;
  email: string;
  address: string;
  id_number?: string;
  id_type?: string;
}

export function useClientAdhesions() {
  const [adhesionRequests, setAdhesionRequests] = useState<ClientAdhesionRequest[]>([]);
  const [userAdhesionRequests, setUserAdhesionRequests] = useState<ClientAdhesionRequest[]>([]);
  const [isLoadingAdhesionRequests, setIsLoadingAdhesionRequests] = useState(false);
  const [isLoadingUserAdhesionRequests, setIsLoadingUserAdhesionRequests] = useState(false);
  const [isCreatingRequest, setIsCreatingRequest] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fonction pour récupérer les demandes d'adhésion de l'utilisateur
  const fetchUserAdhesionRequests = useCallback(async () => {
    if (!user) return;
    
    setIsLoadingUserAdhesionRequests(true);
    
    try {
      const { data, error } = await supabase
        .from('client_adhesion_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      const typedData = data?.map(item => ({
        ...item,
        status: item.status as "pending" | "pending_validation" | "approved" | "rejected"
      })) || [];
      
      setUserAdhesionRequests(typedData);
    } catch (error) {
      console.error('Erreur lors de la récupération des demandes d\'adhésion:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer vos demandes d'adhésion",
        variant: "destructive"
      });
    } finally {
      setIsLoadingUserAdhesionRequests(false);
    }
  }, [user, toast]);

  // Fonction pour récupérer toutes les demandes d'adhésion (pour les admins SFD)
  const fetchAllAdhesionRequests = useCallback(async () => {
    setIsLoadingAdhesionRequests(true);
    
    try {
      // Pour les administrateurs SFD, nous devons récupérer les demandes pour leur SFD
      // Cette logique nécessiterait d'avoir l'ID de la SFD associée à l'administrateur
      // Pour l'instant, récupérons toutes les demandes (à adapter avec la logique de filtrage par SFD)
      const { data, error } = await supabase
        .from('client_adhesion_requests')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      const typedData = data?.map(item => ({
        ...item,
        status: item.status as "pending" | "pending_validation" | "approved" | "rejected"
      })) || [];
      
      setAdhesionRequests(typedData);
    } catch (error) {
      console.error('Erreur lors de la récupération des demandes d\'adhésion:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les demandes d'adhésion",
        variant: "destructive"
      });
    } finally {
      setIsLoadingAdhesionRequests(false);
    }
  }, [toast]);

  // Fonction pour soumettre une demande d'adhésion
  const submitAdhesionRequest = async (sfdId: string, data: AdhesionRequestInput) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour soumettre une demande d'adhésion",
        variant: "destructive"
      });
      return { success: false };
    }
    
    setIsCreatingRequest(true);
    
    try {
      // Vérifier si l'utilisateur a déjà une demande en cours pour cette SFD
      const { data: existingRequests, error: checkError } = await supabase
        .from('client_adhesion_requests')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('sfd_id', sfdId)
        .in('status', ['pending', 'pending_validation']);
        
      if (checkError) throw checkError;
      
      if (existingRequests && existingRequests.length > 0) {
        toast({
          title: "Demande existante",
          description: "Vous avez déjà une demande en cours pour cette SFD",
        });
        return { success: false, error: 'Demande existante' };
      }
      
      // Convert monthly_income to numeric value for database storage
      const monthlyIncome = parseFloat(data.monthly_income);
      
      // Créer la demande d'adhésion
      const { data: newRequest, error } = await supabase
        .from('client_adhesion_requests')
        .insert({
          user_id: user.id,
          sfd_id: sfdId,
          full_name: data.full_name,
          profession: data.profession,
          monthly_income: monthlyIncome,
          source_of_income: data.source_of_income,
          phone: data.phone,
          email: data.email,
          address: data.address,
          id_number: data.id_number,
          id_type: data.id_type,
          status: 'pending',
          reference_number: `ADH-${Date.now().toString(36)}`
        })
        .select()
        .single();
        
      if (error) throw error;
      
      toast({
        title: "Demande envoyée",
        description: "Votre demande d'adhésion a été envoyée avec succès",
      });
      
      // Mettre à jour la liste des demandes de l'utilisateur
      fetchUserAdhesionRequests();
      
      return { success: true, data: newRequest };
    } catch (error) {
      console.error('Erreur lors de la soumission de la demande d\'adhésion:', error);
      toast({
        title: "Erreur",
        description: "Impossible de soumettre votre demande d'adhésion",
        variant: "destructive"
      });
      return { success: false, error };
    } finally {
      setIsCreatingRequest(false);
    }
  };

  // Fonction pour rafraîchir les demandes d'adhésion
  const refetchUserAdhesionRequests = useCallback(() => {
    fetchUserAdhesionRequests();
  }, [fetchUserAdhesionRequests]);

  const refetchAdhesionRequests = useCallback(() => {
    fetchAllAdhesionRequests();
  }, [fetchAllAdhesionRequests]);

  // Charger les demandes d'adhésion au chargement du composant
  useEffect(() => {
    if (user) {
      fetchUserAdhesionRequests();
      fetchAllAdhesionRequests();
    }
  }, [user, fetchUserAdhesionRequests, fetchAllAdhesionRequests]);

  return {
    adhesionRequests,
    userAdhesionRequests,
    isLoadingAdhesionRequests,
    isLoadingUserAdhesionRequests,
    isCreatingRequest,
    submitAdhesionRequest,
    refetchUserAdhesionRequests,
    refetchAdhesionRequests
  };
}
