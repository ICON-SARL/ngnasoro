import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, User, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader } from '@/components/ui/loader';
import { ClientLookupResult } from '@/utils/client-code/lookup';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useClientCodeSearch } from '@/hooks/useClientCodeSearch';
import { validateClientCode } from '@/utils/client-code/validators';
import { formatClientCode } from '@/utils/client-code/formatters';

interface ClientCodeSearchSectionProps {
  onClientFound: (client: ClientLookupResult) => void;
}

export const ClientCodeSearchSection: React.FC<ClientCodeSearchSectionProps> = ({ onClientFound }) => {
  const [clientCode, setClientCode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const { activeSfdId } = useAuth();
  const { toast } = useToast();
  const { searchClient } = useClientCodeSearch();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    
    if (!activeSfdId) {
      setSearchError("Aucune SFD active sélectionnée");
      return;
    }
    
    if (!clientCode.trim()) {
      setSearchError("Code client requis");
      return;
    }
    
    const formattedCode = formatClientCode(clientCode);
    if (!validateClientCode(formattedCode)) {
      setSearchError("Format de code invalide. Le code doit être au format MEREF-SFD-XXXXXX-YYYY");
      return;
    }
    
    setIsSearching(true);
    try {
      const result = await searchClient(formattedCode);
      
      if (result) {
        onClientFound(result);
        setClientCode('');
      } else {
        setSearchError("Aucun utilisateur trouvé avec ce code client");
      }
    } catch (error: any) {
      console.error('Error searching client:', error);
      setSearchError(error.message || "Une erreur est survenue lors de la recherche");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-4 bg-gray-50 p-4 rounded-lg border mb-6">
      <h3 className="text-sm font-medium">Rechercher un client existant</h3>
      
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Entrez le code client (ex: MEREF-SFD-ABC123-4567)"
            className="pl-9"
            value={clientCode}
            onChange={(e) => setClientCode(e.target.value)}
            disabled={isSearching}
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
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{searchError}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};
