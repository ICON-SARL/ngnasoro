
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Sfd {
  id: string;
  name: string;
  code: string;
  region: string;
  status: string;
  logo_url: string | null;
  contact_email: string | null;
  phone: string | null;
  description: string | null;
  legal_document_url: string | null;
  created_at: string;
}

export function useSfdData() {
  const { user, activeSfdId } = useAuth();

  const { data: sfds, isLoading: isLoadingSfds } = useQuery({
    queryKey: ['sfds'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sfds')
        .select('*')
        .eq('status', 'active');
      if (error) throw error;
      return data as Sfd[];
    },
    enabled: !!user,
  });

  const { data: userSfds, isLoading: isLoadingUserSfds } = useQuery({
    queryKey: ['user-sfds', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('user_sfds')
        .select(`
          *,
          sfds:sfd_id(*)
        `)
        .eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: activeSfd, isLoading: isLoadingActiveSfd } = useQuery({
    queryKey: ['active-sfd', activeSfdId],
    queryFn: async () => {
      if (!activeSfdId) return null;
      const { data, error } = await supabase
        .from('sfds')
        .select('*')
        .eq('id', activeSfdId)
        .single();
      if (error) throw error;
      return data as Sfd;
    },
    enabled: !!activeSfdId,
  });

  const { data: sfdStats } = useQuery({
    queryKey: ['sfd-stats', activeSfdId],
    queryFn: async () => {
      if (!activeSfdId) return null;
      const { data, error } = await supabase
        .from('sfd_stats')
        .select('*')
        .eq('sfd_id', activeSfdId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!activeSfdId,
  });

  return {
    sfds,
    userSfds,
    activeSfd,
    sfdStats,
    isLoading: isLoadingSfds || isLoadingUserSfds || isLoadingActiveSfd,
  };
}

// Kept for backward compatibility
export const useSfdsList = () => {
  const fetchSfdsList = async (): Promise<Sfd[]> => {
    const { data, error } = await supabase
      .from('sfds')
      .select('*')
      .order('name');
      
    if (error) {
      console.error('Error fetching SFDs list:', error);
      throw error;
    }
    
    return data as Sfd[];
  };
  
  return useQuery({
    queryKey: ['sfds-list'],
    queryFn: fetchSfdsList,
  });
};
