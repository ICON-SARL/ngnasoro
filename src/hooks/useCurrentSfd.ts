
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useCurrentSfd() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['current-sfd', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data: userSfd, error: userSfdError } = await supabase
        .from('user_sfds')
        .select('sfd_id')
        .eq('user_id', user.id)
        .single();

      if (userSfdError) throw userSfdError;
      if (!userSfd?.sfd_id) return null;

      const { data: sfd, error: sfdError } = await supabase
        .from('sfds')
        .select(`
          *,
          sfd_stats (
            total_clients
          )
        `)
        .eq('id', userSfd.sfd_id)
        .single();

      if (sfdError) throw sfdError;
      return {
        ...sfd,
        client_count: sfd.sfd_stats?.[0]?.total_clients || 0
      };
    },
    enabled: !!user?.id,
  });
}
