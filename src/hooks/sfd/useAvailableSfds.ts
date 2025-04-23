
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
    fetchData();
  }, [userId]);
  
  const fetchData = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching available SFDs for user:', userId || 'anonymous');
      
      // Récupérer toutes les SFDs actives
      const { data: sfdsData, error: sfdsError } = await supabase
        .from('sfds')
        .select('id, name, code, region, status, logo_url, description')
        .eq('status', 'active');
        
      if (sfdsError) {
        console.error('Error fetching SFDs:', sfdsError);
        throw sfdsError;
      }
      
      console.log('Active SFDs:', sfdsData?.length || 0);
      let userSfdIds: string[] = [];
      let pendingSfdIds: string[] = [];
      
      if (userId) {
        // Récupérer les SFDs auxquelles l'utilisateur est déjà associé
        const { data: userSfds, error: userSfdsError } = await supabase
          .from('user_sfds')
          .select('sfd_id')
          .eq('user_id', userId);
          
        if (userSfdsError) {
          console.error('Error fetching user SFDs:', userSfdsError);
        } else {
          userSfdIds = userSfds?.map(us => us.sfd_id) || [];
          console.log('User already associated with SFDs:', userSfdIds.length);
        }
        
        // Récupérer les demandes d'adhésion en attente
        const { data: requests, error: requestsError } = await supabase
          .from('client_adhesion_requests')
          .select('sfd_id, status')
          .eq('user_id', userId);
          
        if (requestsError) {
          console.error('Error fetching adhesion requests:', requestsError);
        } else {
          pendingSfdIds = requests
            ?.filter(req => req.status === 'pending')
            .map(req => req.sfd_id) || [];
          console.log('Pending adhesion requests:', pendingSfdIds.length);
          setPendingRequests(requests?.filter(req => req.status === 'pending') || []);
        }
      }
      
      // Filtrer les SFDs auxquelles l'utilisateur n'est pas déjà associé
      const availableSfdsFiltered = sfdsData?.filter(sfd => 
        !userSfdIds.includes(sfd.id) && 
        !pendingSfdIds.includes(sfd.id) &&
        sfd.status === 'active'
      ) || [];
      
      console.log('Available SFDs after filtering:', availableSfdsFiltered.length);
      setAvailableSfds(availableSfdsFiltered);
      
      // Si aucune SFD n'est disponible et en mode dev, ajouter des SFDs de test
      if (availableSfdsFiltered.length === 0 && process.env.NODE_ENV !== 'production') {
        console.log('Adding test SFDs for development');
        setAvailableSfds([
          {
            id: 'test-sfd1',
            name: 'RMCR (Test)',
            code: 'RMCR',
            region: 'Centre',
            status: 'active',
            logo_url: null
          },
          {
            id: 'test-sfd2',
            name: 'NYESIGISO (Test)',
            code: 'NYESIGISO',
            region: 'Sud',
            status: 'active',
            logo_url: null
          }
        ]);
      }
    } catch (error) {
      console.error('Error in useAvailableSfds:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de récupérer la liste des SFDs disponibles',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

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
        .select('full_name, email, phone')
        .eq('id', userId)
        .single();
        
      if (userError) {
        console.error('Error fetching user profile:', userError);
        throw userError;
      }
      
      const fullName = userData?.full_name || 'Utilisateur';
      const email = userData?.email || null;
      const phone = phoneNumber || userData?.phone || null;
      
      // Create the adhesion request with required full_name field
      const { data, error } = await supabase
        .from('client_adhesion_requests')
        .insert({
          user_id: userId,
          sfd_id: sfdId,
          status: 'pending',
          full_name: fullName,
          email: email,
          phone: phone,
          reference_number: `ADH-${Date.now().toString().substring(6)}`
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
      
      // Refresh data
      fetchData();
      
      return true;
    } catch (error: any) {
      console.error('Error requesting SFD access:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de demander l\'accès à cette SFD',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    availableSfds,
    pendingRequests,
    isLoading,
    requestSfdAccess,
    refreshData: fetchData
  };
}
