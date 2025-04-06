
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SFD {
  id: string;
  name: string;
  code: string;
  region?: string;
  status: string;
}

export const useSFDList = () => {
  const [sfds, setSfds] = useState<SFD[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  
  useEffect(() => {
    const fetchSFDs = async () => {
      setIsLoading(true);
      try {
        // Only fetch active SFDs
        const { data, error } = await supabase
          .from('sfds')
          .select('*')
          .eq('status', 'active')
          .order('name');
        
        if (error) throw error;
        
        setSfds(data || []);
      } catch (err: any) {
        console.error('Error fetching SFDs:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSFDs();
  }, []);
  
  return { sfds, isLoading, error };
};
