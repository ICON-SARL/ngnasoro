
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useActiveSfdId() {
  const { user } = useAuth();
  const [activeSfdId, setActiveSfdId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActiveSfd = async () => {
      if (!user?.id) {
        setActiveSfdId(null);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_sfds')
          .select('sfd_id')
          .eq('user_id', user.id)
          .eq('is_default', true)
          .single();

        if (error && error.code !== 'PGRST116') {
          // If no default, get the first one
          const { data: firstSfd } = await supabase
            .from('user_sfds')
            .select('sfd_id')
            .eq('user_id', user.id)
            .limit(1)
            .single();
          
          setActiveSfdId(firstSfd?.sfd_id || null);
        } else {
          setActiveSfdId(data?.sfd_id || null);
        }
      } catch (err) {
        console.error('Error fetching active SFD:', err);
        setActiveSfdId(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveSfd();
  }, [user?.id]);

  return { activeSfdId, setActiveSfdId, isLoading };
}
