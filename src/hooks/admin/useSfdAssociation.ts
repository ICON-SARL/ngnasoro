
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserSfdAssociation } from '@/hooks/auth/types';

export function useSfdAssociation(userId: string | undefined) {
  const [associations, setAssociations] = useState<UserSfdAssociation[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch user-SFD associations
  useEffect(() => {
    if (!userId) return;
    
    const fetchAssociations = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_sfds')
          .select(`
            id,
            user_id,
            sfd_id,
            is_default,
            sfds:sfd_id (
              id,
              name,
              code,
              region,
              status
            )
          `)
          .eq('user_id', userId);
          
        if (error) throw error;
        
        // Transform data to match the UserSfdAssociation interface
        const transformedData: UserSfdAssociation[] = (data || []).map((item: any) => ({
          id: item.id,
          user_id: item.user_id,
          sfd_id: item.sfd_id,
          is_default: item.is_default,
          sfds: {
            id: item.sfds.id,
            name: item.sfds.name,
            code: item.sfds.code || '',
            region: item.sfds.region,
            status: item.sfds.status || 'active'
          }
        }));
        
        setAssociations(transformedData);
      } catch (error) {
        console.error('Error fetching SFD associations:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de récupérer les associations SFD',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssociations();
  }, [userId, toast]);

  return {
    associations,
    loading,
  };
}
