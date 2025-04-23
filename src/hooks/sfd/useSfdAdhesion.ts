
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ClientAdhesionRequest } from '@/types/adhesionTypes';

export interface AvailableSfd {
  id: string;
  name: string;
  code?: string;
  region?: string;
  description?: string;
  logo_url?: string;
  status: string; // Added status property to match SfdAccountTypes.AvailableSfd
}

export function useSfdAdhesion() {
  const [availableSfds, setAvailableSfds] = useState<AvailableSfd[]>([]);
  const [userRequests, setUserRequests] = useState<ClientAdhesionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const fetchData = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    
    try {
      console.log('Fetching SFD data for user:', user.id);
      
      // 1. Récupérer toutes les SFDs actives
      const { data: sfds, error: sfdsError } = await supabase
        .from('sfds')
        .select('id, name, code, region, description, logo_url, status')
        .eq('status', 'active');
        
      if (sfdsError) {
        console.error('Error fetching SFDs:', sfdsError);
        throw sfdsError;
      }
      
      console.log(`Found ${sfds?.length || 0} active SFDs`);
      
      // 2. Récupérer les demandes d'adhésion de l'utilisateur
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
      
      console.log(`Found ${requests?.length || 0} user requests`);
      
      // 3. Récupérer les SFDs auxquelles l'utilisateur est déjà associé
      const { data: userSfds, error: userSfdsError } = await supabase
        .from('user_sfds')
        .select('sfd_id')
        .eq('user_id', user.id);
        
      if (userSfdsError) {
        console.error('Error fetching user SFDs:', userSfdsError);
        throw userSfdsError;
      }
      
      console.log(`User has ${userSfds?.length || 0} associated SFDs`);
      
      // Filtrer les SFDs déjà associées
      const userSfdIds = userSfds?.map(us => us.sfd_id) || [];
      
      // Convertir les demandes en objets ClientAdhesionRequest
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
      
      // Inclure toutes les SFDs actives sauf celles déjà associées à l'utilisateur
      // Noter que nous autorisons maintenant l'affichage d'une SFD même si l'utilisateur a déjà
      // une demande en cours pour cette SFD, pour permettre de la visualiser
      const filteredSfds = sfds?.filter(sfd => !userSfdIds.includes(sfd.id)) || [];
      
      console.log(`After filtering, ${filteredSfds.length} SFDs are available`);
      
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
  };
  
  useEffect(() => {
    fetchData();
  }, [user?.id, toast]);
  
  const requestSfdAdhesion = async (sfdId: string, phoneNumber?: string) => {
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
      console.log('Requesting adhesion for SFD:', sfdId);
      
      // Vérifier si une demande existe déjà pour ce SFD et cet utilisateur
      const { data: existingRequest } = await supabase
        .from('client_adhesion_requests')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('sfd_id', sfdId)
        .maybeSingle();
        
      // Si une demande existe et n'est pas rejetée, informer l'utilisateur
      if (existingRequest && existingRequest.status !== 'rejected') {
        toast({
          title: 'Demande existante',
          description: 'Vous avez déjà une demande pour cette SFD',
          variant: 'destructive',  // Changed from 'warning' to 'destructive'
        });
        return false;
      }
      
      // Si une demande rejetée existe, la supprimer d'abord
      if (existingRequest && existingRequest.status === 'rejected') {
        console.log('Deleting existing rejected request:', existingRequest.id);
        await supabase
          .from('client_adhesion_requests')
          .delete()
          .eq('id', existingRequest.id);
      }
      
      // Récupérer les informations de profil de l'utilisateur
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single();
      
      // Créer une nouvelle demande d'adhésion
      const { data: newRequest, error } = await supabase
        .from('client_adhesion_requests')
        .insert({
          user_id: user.id,
          sfd_id: sfdId,
          full_name: profile?.full_name || 'Utilisateur',
          email: profile?.email || user.email,
          phone: phoneNumber,
          status: 'pending'
        })
        .select();
        
      if (error) {
        console.error('Error creating adhesion request:', error);
        throw error;
      }
      
      console.log('Adhesion request created:', newRequest);
      
      toast({
        title: 'Demande envoyée',
        description: 'Votre demande d\'adhésion a été envoyée avec succès',
      });
      
      // Rafraîchir les données
      await fetchData();
      
      return true;
    } catch (error) {
      console.error('Error in requestSfdAdhesion:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer la demande d\'adhésion',
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
