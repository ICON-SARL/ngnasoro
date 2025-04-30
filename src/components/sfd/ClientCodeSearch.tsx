import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, User, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatClientCode } from '@/utils/client-code/formatters';
import { validateClientCode } from '@/utils/client-code/validators'; 
import { lookupUserByClientCode, ClientLookupResult } from '@/utils/client-code/lookup';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader } from '@/components/ui/loader';

interface ClientCodeSearchProps {
  onClientFound: (client: ClientLookupResult) => void;
}

export const ClientCodeSearch: React.FC<ClientCodeSearchProps> = ({ onClientFound }) => {
  const [clientCode, setClientCode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSearchError(null);
    
    if (!clientCode.trim()) {
      setSearchError("Code client requis");
      return;
    }
    
    // Format the entered code
    const formattedCode = formatClientCode(clientCode);
    
    // Validate the code format
    if (!validateClientCode(formattedCode)) {
      setSearchError("Format de code invalide. Le code client doit avoir le format SFD-XXXXXX-0000");
      return;
    }
    
    setIsSearching(true);
    try {
      // Look up the user by client code
      const clientData = await lookupUserByClientCode(formattedCode);
      
      if (!clientData) {
        setSearchError("Aucun utilisateur trouvé avec ce code client");
        return;
      }
      
      onClientFound(clientData);
      toast({
        title: "Utilisateur trouvé",
        description: `Utilisateur ${clientData.full_name} peut être ajouté comme client`,
      });
      
      setClientCode('');
    } catch (error) {
      console.error('Error searching for client:', error);
      setSearchError("Une erreur est survenue lors de la recherche du client");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSearch} className="flex gap-2 w-full">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Entrez le code client (ex: SFD-ABC123-4567)"
            className="pl-9"
            value={clientCode}
            onChange={(e) => setClientCode(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={isSearching}>
          {isSearching ? (
            <>
              <Loader size="sm" className="mr-2" />
              Recherche...
            </>
          ) : (
            <>
              <User className="h-4 w-4 mr-2" />
              Rechercher
            </>
          )}
        </Button>
      </form>
      
      {searchError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>{searchError}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};
