
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { SfdClient } from '@/types/sfdClients';

// Define the types for our results
export type ClientSearchResult = SfdClient | {
  user_id: string;
  full_name: string;
  email: string | null;
  phone: string;
  isNewClient: boolean;
};

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
        // First check if the user exists with this phone number
        const { data: userData, error: userError} = await supabase
          .from('profiles')
          .select('id, full_name, phone')
          .eq('phone', phoneNumber)
          .single();
          
        if (userError) {
          if (userError.code === 'PGRST116') {
            toast({
              title: "Utilisateur non trouvé",
              description: `Aucun utilisateur trouvé avec le numéro ${phoneNumber}`,
              variant: "destructive",
            });
          }
          throw userError;
        }
        
        // Now check if this user already has a client account with this SFD
        const { data: existingClient, error: clientError } = await supabase
          .from('sfd_clients')
          .select('*')
          .eq('user_id', userData.id)
          .eq('sfd_id', activeSfdId)
          .maybeSingle();
          
        if (clientError && clientError.code !== 'PGRST116') throw clientError;
        
        if (existingClient) {
          toast({
            title: "Client existant",
            description: `${userData.full_name} est déjà client de votre SFD`,
            variant: "destructive", // Changed from "warning" to "destructive" to match allowed variants
          });
          return existingClient as SfdClient;
        }
        
        // Return user data so we can create a client
        return {
          user_id: userData.id,
          full_name: userData.full_name,
          email: null,
          phone: phoneNumber,
          isNewClient: true
        } as ClientSearchResult;
      } catch (err: any) {
        if (err.code === 'PGRST116') {
          toast({
            title: "Utilisateur non trouvé",
            description: `Aucun utilisateur trouvé avec le numéro ${phoneNumber}`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erreur",
            description: "Erreur lors de la recherche de l'utilisateur",
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
