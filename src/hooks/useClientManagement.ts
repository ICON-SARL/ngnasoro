
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useClientManagement() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const fetchClients = async () => {
    setIsLoading(true);
    try {
      // Fetch clients
      const { data, error } = await supabase
        .from('sfd_clients')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les clients",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fixed: removed unnecessary argument
  const refetch = async () => {
    return await fetchClients();
  };
  
  return {
    fetchClients,
    refetch,
    isLoading
  };
}
