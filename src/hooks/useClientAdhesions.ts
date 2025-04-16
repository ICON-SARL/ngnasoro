
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface AdhesionRequestInput {
  full_name: string;
  email?: string;
  phone?: string;
  address?: string;
  profession?: string;
  monthly_income?: string;
  source_of_income?: string;
}

export interface AdhesionRequest {
  id: string;
  sfd_id: string;
  sfd_name?: string;
  user_id: string;
  full_name: string;
  email?: string;
  phone?: string;
  status: string;
  created_at: string;
  notes?: string;
}

export function useClientAdhesions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoadingUserAdhesionRequests, setIsLoadingUserAdhesionRequests] = useState(false);
  const [userAdhesionRequests, setUserAdhesionRequests] = useState<AdhesionRequest[]>([]);
  const [isCreatingRequest, setIsCreatingRequest] = useState(false);
  const [isLoadingAdhesionRequests, setIsLoadingAdhesionRequests] = useState(false);
  const [adhesionRequests, setAdhesionRequests] = useState<any[]>([]);
  
  // Fetch user's adhesion requests
  const fetchUserAdhesionRequests = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoadingUserAdhesionRequests(true);
      
      const { data, error } = await supabase
        .from('client_adhesion_requests')
        .select(`
          *,
          sfds:sfd_id (name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching adhesion requests:', error);
        toast({
          title: 'Erreur',
          description: "Impossible de récupérer vos demandes d'adhésion",
          variant: 'destructive',
        });
        return;
      }
      
      // Format the requests with SFD name
      const formattedRequests = data.map(req => ({
        ...req,
        sfd_name: req.sfds?.name
      }));
      
      setUserAdhesionRequests(formattedRequests);
      console.log(`Found ${formattedRequests.length} user adhesion requests`);
    } catch (error) {
      console.error('Error in fetchUserAdhesionRequests:', error);
    } finally {
      setIsLoadingUserAdhesionRequests(false);
    }
  }, [user, toast]);
  
  // Fetch all adhesion requests for admin
  const fetchAdhesionRequests = useCallback(async (sfdId?: string) => {
    if (!user) return;
    
    try {
      setIsLoadingAdhesionRequests(true);
      console.log(`Fetching adhesion requests for SFD: ${sfdId || 'all'}`);
      
      // We can use metadata to get the admin's SFD ID if not specified
      const adminSfdId = sfdId || user.user_metadata?.sfd_id;
      
      if (!adminSfdId) {
        console.error('No SFD ID available for admin');
        toast({
          title: 'Erreur',
          description: "Impossible de déterminer votre SFD",
          variant: 'destructive',
        });
        return;
      }
      
      const { data, error } = await supabase
        .from('client_adhesion_requests')
        .select('*')
        .eq('sfd_id', adminSfdId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching adhesion requests for admin:', error);
        toast({
          title: 'Erreur',
          description: "Impossible de récupérer les demandes d'adhésion",
          variant: 'destructive',
        });
        return;
      }
      
      setAdhesionRequests(data || []);
      console.log(`Success: Found ${data?.length} adhesion requests`);
    } catch (error) {
      console.error('Error in fetchAdhesionRequests:', error);
    } finally {
      setIsLoadingAdhesionRequests(false);
    }
  }, [user, toast]);
  
  // Submit a new adhesion request
  const submitAdhesionRequest = async (sfdId: string, data: AdhesionRequestInput) => {
    if (!user) {
      toast({
        title: 'Erreur',
        description: "Vous devez être connecté pour soumettre une demande d'adhésion",
        variant: 'destructive',
      });
      return { success: false };
    }
    
    try {
      setIsCreatingRequest(true);
      
      const { error } = await supabase
        .from('client_adhesion_requests')
        .insert({
          sfd_id: sfdId,
          user_id: user.id,
          full_name: data.full_name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          profession: data.profession,
          monthly_income: data.monthly_income,
          source_of_income: data.source_of_income,
          status: 'pending'
        });
        
      if (error) {
        console.error('Error submitting adhesion request:', error);
        toast({
          title: 'Erreur',
          description: "Impossible de soumettre votre demande d'adhésion",
          variant: 'destructive',
        });
        return { success: false };
      }
      
      toast({
        title: 'Demande envoyée',
        description: "Votre demande d'adhésion a été soumise avec succès",
      });
      
      // Refresh user's requests
      await fetchUserAdhesionRequests();
      
      return { success: true };
    } catch (error) {
      console.error('Error in submitAdhesionRequest:', error);
      toast({
        title: 'Erreur',
        description: "Une erreur est survenue lors de la soumission de votre demande",
        variant: 'destructive',
      });
      return { success: false };
    } finally {
      setIsCreatingRequest(false);
    }
  };
  
  // Initial data loading
  useEffect(() => {
    if (user) {
      fetchUserAdhesionRequests();
    }
  }, [user, fetchUserAdhesionRequests]);
  
  return {
    // User adhesion requests
    userAdhesionRequests,
    isLoadingUserAdhesionRequests,
    fetchUserAdhesionRequests,
    refetchUserAdhesionRequests: fetchUserAdhesionRequests,
    
    // Admin adhesion requests
    adhesionRequests,
    isLoadingAdhesionRequests,
    fetchAdhesionRequests,
    refetchAdhesionRequests: fetchAdhesionRequests,
    
    // Actions
    submitAdhesionRequest,
    isCreatingRequest
  };
}
