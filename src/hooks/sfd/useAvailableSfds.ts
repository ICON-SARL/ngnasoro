
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AvailableSfd } from '@/components/mobile/profile/sfd-accounts/types/SfdAccountTypes';

export function useAvailableSfds(userId?: string) {
  const [availableSfds, setAvailableSfds] = useState<AvailableSfd[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;
    
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Récupérer toutes les SFDs actives
        const { data: sfdsData, error: sfdsError } = await supabase
          .from('sfds')
          .select('id, name, code, region, status, logo_url, description')
          .eq('status', 'active');
          
        if (sfdsError) throw sfdsError;
        
        // Récupérer les SFDs auxquelles l'utilisateur est déjà associé
        const { data: userSfds, error: userSfdsError } = await supabase
          .from('user_sfds')
          .select('sfd_id')
          .eq('user_id', userId);
          
        if (userSfdsError) throw userSfdsError;
        
        // Récupérer les demandes d'adhésion en attente
        const { data: requests, error: requestsError } = await supabase
          .from('client_adhesion_requests')
          .select('sfd_id, status')
          .eq('user_id', userId);
          
        if (requestsError) throw requestsError;
        
        // Filtrer les SFDs auxquelles l'utilisateur n'est pas déjà associé
        const userSfdIds = userSfds.map(us => us.sfd_id);
        const pendingSfdIds = requests
          .filter(req => req.status === 'pending')
          .map(req => req.sfd_id);
          
        const availableSfdsFiltered = sfdsData.filter(sfd => 
          !userSfdIds.includes(sfd.id) && 
          !pendingSfdIds.includes(sfd.id) &&
          sfd.status === 'active'
        );
        
        setPendingRequests(requests.filter(req => req.status === 'pending'));
        setAvailableSfds(availableSfdsFiltered);
      } catch (error) {
        console.error('Error fetching available SFDs:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de récupérer la liste des SFDs disponibles',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [userId, toast]);

  // Accept phone number as optional parameter
  const requestSfdAccess = async (sfdId: string, phoneNumber?: string) => {
    if (!userId) {
      toast({
        title: 'Erreur',
        description: 'Vous devez être connecté pour demander l\'accès à une SFD',
        variant: 'destructive',
      });
      return false;
    }
    
    try {
      console.log(`Requesting access to SFD ${sfdId}${phoneNumber ? ` with phone ${phoneNumber}` : ''}`);
      
      // Get user details to provide full name
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single();
        
      if (userError) {
        console.error('Error fetching user profile:', userError);
        throw userError;
      }
      
      const fullName = userData?.full_name || 'Unnamed User';
      
      // Create the adhesion request with required full_name field
      const { data, error } = await supabase
        .from('client_adhesion_requests')
        .insert({
          user_id: userId,
          sfd_id: sfdId,
          status: 'pending',
          full_name: fullName,
          phone: phoneNumber || null
        })
        .select();
        
      if (error) {
        console.error('Error creating adhesion request:', error);
        throw error;
      }
      
      toast({
        title: 'Demande envoyée',
        description: 'Votre demande d\'adhésion a été envoyée avec succès',
      });
      
      // Return true to indicate success
      return true;
    } catch (error) {
      console.error('Error requesting SFD access:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de demander l\'accès à cette SFD',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    availableSfds,
    pendingRequests,
    isLoading,
    requestSfdAccess
  };
}
