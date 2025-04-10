
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SfdData {
  id: string;
  name: string;
  code?: string;
  region?: string;
  logo_url?: string;
  status?: string;
}

export function useSfdDataAccess() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeSfdId, setActiveSfdId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchActiveSfd();
    } else {
      setIsLoading(false);
    }
  }, [user?.id]);

  const fetchActiveSfd = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_sfds')
        .select('sfd_id')
        .eq('user_id', user?.id)
        .eq('is_default', true)
        .single();
        
      if (error) {
        console.error('Error fetching active SFD:', error);
        setActiveSfdId(null);
      } else {
        setActiveSfdId(data?.sfd_id || null);
      }
    } catch (error) {
      console.error('Error in fetchActiveSfd:', error);
      setActiveSfdId(null);
    } finally {
      setIsLoading(false);
    }
  };

  const switchActiveSfd = async (sfdId: string): Promise<boolean> => {
    if (!user?.id) return false;
    
    try {
      // First, set all SFDs to not default
      await supabase
        .from('user_sfds')
        .update({ is_default: false })
        .eq('user_id', user.id);
        
      // Then set the selected SFD as default
      const { error } = await supabase
        .from('user_sfds')
        .update({ is_default: true })
        .eq('user_id', user.id)
        .eq('sfd_id', sfdId);
        
      if (error) throw error;
      
      // Update local state
      setActiveSfdId(sfdId);
      
      toast({
        title: "SFD activée",
        description: "Votre SFD active a été mise à jour",
      });
      
      return true;
    } catch (error) {
      console.error('Error switching active SFD:', error);
      toast({
        title: "Erreur",
        description: "Impossible de changer de SFD active",
        variant: "destructive",
      });
      return false;
    }
  };
  
  const getActiveSfdData = async (): Promise<SfdData | null> => {
    if (!activeSfdId) return null;
    
    try {
      const { data, error } = await supabase
        .from('sfds')
        .select('*')
        .eq('id', activeSfdId)
        .single();
        
      if (error) throw error;
      return data as SfdData;
    } catch (error) {
      console.error('Error fetching active SFD data:', error);
      return null;
    }
  };

  return {
    activeSfdId,
    isLoading,
    switchActiveSfd,
    getActiveSfdData,
    refreshActiveSfd: fetchActiveSfd
  };
}
