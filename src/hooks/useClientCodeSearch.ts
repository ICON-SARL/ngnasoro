
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { lookupUserByClientCode, ClientLookupResult } from '@/utils/client-code/lookup';
import { validateClientCode } from '@/utils/client-code/validators';
import { formatClientCode } from '@/utils/client-code/formatters';

export function useClientCodeSearch() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const { activeSfdId } = useAuth();
  const { toast } = useToast();

  const searchClient = async (clientCode: string): Promise<ClientLookupResult | null> => {
    setSearchError(null);
    
    if (!activeSfdId) {
      setSearchError("Aucune SFD active sélectionnée");
      return null;
    }
    
    if (!clientCode.trim()) {
      setSearchError("Code client requis");
      return null;
    }
    
    const formattedCode = formatClientCode(clientCode);
    if (!validateClientCode(formattedCode)) {
      setSearchError("Format de code invalide");
      return null;
    }
    
    setIsSearching(true);
    try {
      const result = await lookupUserByClientCode(formattedCode, activeSfdId);
      
      if (result) {
        if (result.sfd_id === activeSfdId) {
          toast({
            title: "Client déjà existant",
            description: `${result.full_name} est déjà client de votre SFD`,
            variant: "destructive"
          });
          return null;
        }
        return result;
      } else {
        setSearchError("Aucun utilisateur trouvé avec ce code client");
        return null;
      }
    } catch (error: any) {
      console.error('Error searching client:', error);
      setSearchError(error.message || "Une erreur est survenue lors de la recherche");
      return null;
    } finally {
      setIsSearching(false);
    }
  };

  return {
    isSearching,
    searchError,
    searchClient,
  };
}
