
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { AvailableSfd, SfdClientRequest } from '@/components/mobile/profile/sfd-accounts/types/SfdAccountTypes';

export function useSfdAdhesion() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [availableSfds, setAvailableSfds] = useState<AvailableSfd[]>([]);
  const [userRequests, setUserRequests] = useState<SfdClientRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
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
        
        const formattedRequests: SfdClientRequest[] = requests.map(request => ({
          id: request.id,
          sfd_id: request.sfd_id,
          sfd_name: request.sfds?.name,
          status: request.status,
          created_at: request.created_at
        }));
        
        setAvailableSfds(sfds as AvailableSfd[]);
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

  return {
    availableSfds,
    userRequests,
    isLoading
  };
}
