
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { AvailableSfd, SfdClientRequest } from '@/components/mobile/profile/sfd-accounts/types/SfdAccountTypes';
import { logAuditEvent, AuditLogCategory, AuditLogSeverity } from '@/utils/audit';

export function useSfdAdhesion() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [availableSfds, setAvailableSfds] = useState<AvailableSfd[]>([]);
  const [userRequests, setUserRequests] = useState<SfdClientRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fetchData = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      console.log('Fetching SFD adhesion data for user:', user.id);
      
      // 1. Get all active SFDs
      const { data: sfds, error: sfdsError } = await supabase
        .from('sfds')
        .select('id, name, code, region, status, logo_url, description')
        .eq('status', 'active');
      
      if (sfdsError) {
        console.error('Error fetching SFDs:', sfdsError);
        throw sfdsError;
      }
      
      if (!sfds || sfds.length === 0) {
        console.log('No active SFDs found');
      } else {
        console.log(`Found ${sfds.length} active SFDs`);
      }
      
      // 2. Get user's existing requests
      const { data: requests, error: requestsError } = await supabase
        .from('client_adhesion_requests')
        .select('id, sfd_id, status, created_at, sfds:sfd_id(name), full_name, email, phone')
        .eq('user_id', user.id);
      
      if (requestsError) {
        console.error('Error fetching user requests:', requestsError);
        throw requestsError;
      }
      
      console.log(`Found ${requests?.length || 0} existing client requests`);
      
      // 3. Get user's existing SFD associations
      const { data: userSfds, error: userSfdsError } = await supabase
        .from('user_sfds')
        .select('sfd_id')
        .eq('user_id', user.id);
        
      if (userSfdsError) {
        console.error('Error fetching user SFDs:', userSfdsError);
        throw userSfdsError;
      }
      
      console.log(`Found ${userSfds?.length || 0} existing user SFD associations`);
      
      // Filter out SFDs the user already has or has requested
      const userSfdIds = userSfds?.map(us => us.sfd_id) || [];
      const requestedSfdIds = requests?.map(req => req.sfd_id) || [];
      
      const availableSfdsList = (sfds || []).filter(sfd => 
        !userSfdIds.includes(sfd.id) && 
        !requestedSfdIds.includes(sfd.id)
      );
      
      console.log(`After filtering, ${availableSfdsList.length} SFDs are available to join`);
      
      // Format the requests data
      const formattedRequests: SfdClientRequest[] = (requests || []).map(request => ({
        id: request.id,
        sfd_id: request.sfd_id,
        sfd_name: request.sfds?.name,
        full_name: request.full_name,
        email: request.email,
        phone: request.phone,
        status: request.status as 'pending' | 'approved' | 'rejected',
        created_at: request.created_at
      }));
      
      setAvailableSfds(availableSfdsList as AvailableSfd[]);
      setUserRequests(formattedRequests);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données des SFD',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const requestSfdAdhesion = async (sfdId: string) => {
    if (!user) {
      toast({
        title: 'Erreur',
        description: 'Vous devez être connecté pour demander une adhésion',
        variant: 'destructive',
      });
      return false;
    }
    
    console.log(`Attempting to request adhesion to SFD: ${sfdId}`);
    setIsSubmitting(true);
    
    try {
      // Get user profile data for the request
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, email, phone')
        .eq('id', user.id)
        .single();
        
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw profileError;
      }
      
      if (!profile) {
        throw new Error('Profil utilisateur introuvable');
      }
      
      console.log('User profile retrieved:', profile);
      
      // Create the adhesion request
      console.log('Creating adhesion request with data:', {
        user_id: user.id,
        sfd_id: sfdId,
        full_name: profile.full_name || 'Utilisateur sans nom',
        email: profile.email,
        phone: profile.phone || null,
        status: 'pending'
      });
      
      const { data, error } = await supabase
        .from('client_adhesion_requests')
        .insert({
          user_id: user.id,
          sfd_id: sfdId,
          full_name: profile.full_name || 'Utilisateur sans nom',
          email: profile.email,
          phone: profile.phone || null,
          status: 'pending'
        })
        .select();
        
      if (error) {
        console.error('Error creating adhesion request:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        throw new Error('La demande a été créée mais aucune donnée n\'a été retournée');
      }
      
      console.log('Adhesion request created successfully:', data[0]);
      
      // Log audit event
      await logAuditEvent({
        user_id: user.id,
        action: 'sfd_adhesion_requested',
        category: AuditLogCategory.USER_MANAGEMENT,
        severity: AuditLogSeverity.INFO,
        status: 'success',
        target_resource: `client_adhesion_requests/${data[0].id}`,
        details: { 
          sfd_id: sfdId
        }
      });
      
      toast({
        title: 'Demande envoyée',
        description: 'Votre demande d\'adhésion a été envoyée avec succès',
      });
      
      // Update local state
      const sfd = availableSfds.find(s => s.id === sfdId);
      const newRequest: SfdClientRequest = {
        id: data[0].id,
        sfd_id: sfdId,
        sfd_name: sfd?.name,
        status: 'pending',
        created_at: data[0].created_at,
        full_name: profile.full_name || 'Utilisateur sans nom',
        email: profile.email,
        phone: profile.phone || null
      };
      
      setUserRequests([...userRequests, newRequest]);
      setAvailableSfds(availableSfds.filter(sfd => sfd.id !== sfdId));
      
      return true;
    } catch (error: any) {
      console.error('Error requesting SFD adhesion:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de soumettre votre demande d\'adhésion',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  return {
    availableSfds,
    userRequests,
    isLoading,
    isSubmitting,
    requestSfdAdhesion,
    refetch
  };
}
