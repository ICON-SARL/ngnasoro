
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ClientAdhesionRequest } from '@/types/adhesionTypes';

export interface AvailableSfd {
  id: string;
  name: string;
  code: string;
  region?: string;
  description?: string;
  logo_url?: string;
  status: string;
}

export function useSfdAdhesion() {
  const [availableSfds, setAvailableSfds] = useState<AvailableSfd[]>([]);
  const [userRequests, setUserRequests] = useState<ClientAdhesionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    
    try {
      console.log('Fetching SFD data for user:', user.id);
      
      // Récupérer toutes les SFDs actives
      const { data: sfds, error: sfdsError } = await supabase
        .from('sfds')
        .select('id, name, code, region, description, logo_url, status')
        .eq('status', 'active');
        
      if (sfdsError) {
        console.error('Error fetching SFDs:', sfdsError);
        throw sfdsError;
      }

      console.log('SFDs récupérées:', sfds?.length || 0);
      
      // Récupérer les demandes d'adhésion de l'utilisateur
      const { data: requests, error: requestsError } = await supabase
        .from('client_adhesion_requests')
        .select(`
          id, 
          user_id,
          sfd_id,
          full_name,
          status,
          created_at,
          processed_at,
          sfds (name, logo_url)
        `)
        .eq('user_id', user.id);
        
      if (requestsError) {
        console.error('Error fetching user requests:', requestsError);
        throw requestsError;
      }
      
      console.log('Demandes d\'adhésion utilisateur:', requests?.length || 0);
      
      // Récupérer les SFDs déjà associées à l'utilisateur
      const { data: userSfds, error: userSfdsError } = await supabase
        .from('user_sfds')
        .select('sfd_id')
        .eq('user_id', user.id);
        
      if (userSfdsError) {
        console.error('Error fetching user SFDs:', userSfdsError);
        throw userSfdsError;
      }
      
      console.log('SFDs associées à l\'utilisateur:', userSfds?.length || 0);
      
      const userSfdIds = userSfds?.map(us => us.sfd_id) || [];
      const pendingRequestIds = requests
        ?.filter(req => req.status === 'pending')
        .map(req => req.sfd_id) || [];
      
      // Format the requests for display
      const formattedRequests = requests?.map(req => ({
        id: req.id,
        user_id: req.user_id,
        sfd_id: req.sfd_id,
        full_name: req.full_name,
        status: req.status as 'pending' | 'approved' | 'rejected',
        created_at: req.created_at,
        processed_at: req.processed_at,
        sfd_name: req.sfds?.name || '',
        sfds: req.sfds
      })) || [];
      
      // Filtrage: afficher les SFDs qui ne sont pas déjà associées et pour lesquelles il n'y a pas de demande en cours
      const filteredSfds = (sfds || []).filter(sfd => 
        !userSfdIds.includes(sfd.id) && 
        !pendingRequestIds.includes(sfd.id) && 
        sfd.status === 'active'
      );
      
      console.log(`Après filtrage, ${filteredSfds.length} SFDs sont disponibles`);
      
      setUserRequests(formattedRequests);
      setAvailableSfds(filteredSfds);
    } catch (error) {
      console.error('Error in useSfdAdhesion:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de récupérer les données SFD',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, toast]);
  
  // Charger les données au montage et lorsque l'utilisateur change
  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user?.id, fetchData]);
  
  const requestSfdAdhesion = async (sfdId: string, formData: any) => {
    if (!user?.id) {
      toast({
        title: 'Erreur',
        description: 'Vous devez être connecté pour faire une demande d\'adhésion',
        variant: 'destructive',
      });
      return false;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('Envoi de la demande d\'adhésion pour SFD:', sfdId);
      
      // Vérifier si une demande existe déjà
      const { data: existingRequest, error: checkError } = await supabase
        .from('client_adhesion_requests')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('sfd_id', sfdId)
        .maybeSingle();
        
      if (checkError) {
        console.error('Erreur lors de la vérification des demandes existantes:', checkError);
        throw checkError;
      }
      
      if (existingRequest && existingRequest.status !== 'rejected') {
        toast({
          title: 'Demande existante',
          description: 'Vous avez déjà une demande pour cette SFD',
          variant: 'destructive',
        });
        return false;
      }
      
      if (existingRequest && existingRequest.status === 'rejected') {
        console.log('Suppression de la demande rejetée existante:', existingRequest.id);
        await supabase
          .from('client_adhesion_requests')
          .delete()
          .eq('id', existingRequest.id);
      }
      
      // Récupérer les infos du profile utilisateur
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, email, phone')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error('Erreur lors de la récupération du profil:', profileError);
      }
      
      // Préparer les données de la demande
      const requestData = {
        user_id: user.id,
        sfd_id: sfdId,
        full_name: formData.fullName || profile?.full_name || 'Utilisateur',
        email: formData.email || profile?.email || user.email,
        phone: formData.phone || profile?.phone,
        address: formData.address || '',
        id_number: formData.idNumber || '',
        id_type: formData.idType || 'cni',
        status: 'pending',
        reference_number: `ADH-${Date.now().toString().substring(6)}`
      };
      
      // Créer la demande d'adhésion
      const { data: newRequest, error: insertError } = await supabase
        .from('client_adhesion_requests')
        .insert(requestData)
        .select();
        
      if (insertError) {
        console.error('Erreur lors de la création de la demande d\'adhésion:', insertError);
        throw insertError;
      }
      
      console.log('Demande d\'adhésion créée:', newRequest);
      
      toast({
        title: 'Demande envoyée',
        description: 'Votre demande d\'adhésion a été envoyée avec succès',
      });
      
      // Actualiser les données
      await fetchData();
      
      return true;
    } catch (error: any) {
      console.error('Erreur lors de la demande d\'adhésion:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'envoyer la demande d\'adhésion',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    availableSfds,
    userRequests,
    isLoading,
    isSubmitting,
    refetch: fetchData,
    requestSfdAdhesion
  };
}
