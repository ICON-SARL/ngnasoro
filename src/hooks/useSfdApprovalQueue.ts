import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SfdPending {
  id: string;
  name: string;
  code: string;
  region: string;
  contact_email: string;
  phone: string;
  status: string;
  submitted_at: string;
  description: string;
  address: string;
}

export function useSfdApprovalQueue() {
  const [pendingSfds, setPendingSfds] = useState<SfdPending[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchPendingSfds = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('sfds')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPendingSfds(data || []);
    } catch (error: any) {
      console.error('Error fetching pending SFDs:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les demandes en attente',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingSfds();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('sfd_approvals')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sfds',
          filter: 'status=eq.pending'
        },
        () => {
          fetchPendingSfds();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    pendingSfds,
    isLoading,
    refetch: fetchPendingSfds
  };
}
