
import { useState, useEffect } from 'react';
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
  
  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data: sfds, error: sfdsError } = await supabase
          .from('sfds')
          .select('id, name, code, region, status, logo_url, description')
          .eq('status', 'active');
        
        if (sfdsError) throw sfdsError;
        
        const { data: requests, error: requestsError } = await supabase
          .from('client_adhesion_requests')
          .select('id, sfd_id, status, created_at, sfds:sfd_id(name)')
          .eq('user_id', user.id);
        
        if (requestsError) throw requestsError;
        
        const { data: userSfds, error: userSfdsError } = await supabase
          .from('user_sfds')
          .select('sfd_id')
          .eq('user_id', user.id);
          
        if (userSfdsError) throw userSfdsError;
        
        const userSfdIds = userSfds?.map(us => us.sfd_id) || [];
        const requestedSfdIds = requests?.map(req => req.sfd_id) || [];
        
        const availableSfdsList = (sfds || []).filter(sfd => 
          !userSfdIds.includes(sfd.id) && 
          !requestedSfdIds.includes(sfd.id)
        );
        
        const formattedRequests: SfdClientRequest[] = (requests || []).map(request => ({
          id: request.id,
          sfd_id: request.sfd_id,
          sfd_name: request.sfds?.name,
          status: request.status,
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
    };
    
    fetchData();
  }, [user, toast]);

  const requestSfdAdhesion = async (sfdId: string) => {
    if (!user) {
      toast({
        title: 'Erreur',
        description: 'Vous devez être connecté pour demander une adhésion',
        variant: 'destructive',
      });
      return false;
    }
    
    setIsSubmitting(true);
    
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, email, phone')
        .eq('id', user.id)
        .single();
        
      if (profileError) throw profileError;
      
      if (!profile) {
        throw new Error('Profil utilisateur introuvable');
      }
      
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
        
      if (error) throw error;
      
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
      
      const sfd = availableSfds.find(s => s.id === sfdId);
      const newRequest: SfdClientRequest = {
        id: data[0].id,
        sfd_id: sfdId,
        sfd_name: sfd?.name,
        status: 'pending',
        created_at: data[0].created_at
      };
      
      setUserRequests([...userRequests, newRequest]);
      setAvailableSfds(availableSfds.filter(sfd => sfd.id !== sfdId));
      
      return true;
    } catch (error) {
      console.error('Error requesting SFD adhesion:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de soumettre votre demande d\'adhésion',
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
    requestSfdAdhesion
  };
}
