
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export function useClientByPhone() {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const { activeSfdId } = useAuth();
  const { toast } = useToast();

  const {
    data: client,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['client-by-phone', phoneNumber, activeSfdId],
    queryFn: async () => {
      if (!phoneNumber || !activeSfdId) return null;
      
      try {
        const { data, error } = await supabase
          .from('sfd_clients')
          .select('*')
          .eq('phone', phoneNumber)
          .eq('sfd_id', activeSfdId)
          .single();
          
        if (error) throw error;
        return data;
      } catch (err: any) {
        if (err.code === 'PGRST116') {
          toast({
            title: "Client non trouvé",
            description: `Aucun client trouvé avec le numéro ${phoneNumber}`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erreur",
            description: "Erreur lors de la recherche du client",
            variant: "destructive",
          });
        }
        throw err;
      }
    },
    enabled: false // Don't run query on mount
  });
  
  const searchClient = async (phone: string) => {
    setPhoneNumber(phone);
    return refetch();
  };
  
  return {
    client,
    isLoading,
    error,
    searchClient
  };
}
