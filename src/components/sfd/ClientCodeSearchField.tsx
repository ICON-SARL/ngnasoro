
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, User, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatClientCode, validateClientCode } from '@/utils/clientCodeUtils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader } from '@/components/ui/loader';

interface ClientCodeSearchFieldProps {
  onClientFound: (client: any) => void;
  onSearchStart?: () => void;
  onSearchComplete?: (success: boolean) => void;
  isSearching: boolean;
  searchClientByCode: (code: string) => Promise<any>;
}

export const ClientCodeSearchField: React.FC<ClientCodeSearchFieldProps> = ({ 
  onClientFound,
  onSearchStart,
  onSearchComplete,
  isSearching,
  searchClientByCode
}) => {
  const [clientCode, setClientCode] = useState('');
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
      setSearchError("Format de code invalide. Le code client doit avoir le format MEREF-SFD******-****");
      return;
    }
    
    onSearchStart?.();
    
    try {
      const result = await searchClientByCode(formattedCode);
      
      if (result) {
        onClientFound(result);
        setClientCode('');
        onSearchComplete?.(true);
      } else {
        setSearchError("Aucun client trouvé avec ce code. Vérifiez que le code est correct et que la SFD est active.");
        onSearchComplete?.(false);
      }
    } catch (error: any) {
      console.error('Error searching for client:', error);
      setSearchError(error.message || "Une erreur est survenue lors de la recherche du client");
      onSearchComplete?.(false);
    }
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSearch} className="flex gap-2 w-full">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="MEREF-SFD******-****"
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
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>{searchError}</AlertDescription>
        </Alert>
      )}

      <div className="text-sm text-gray-500">
        Format requis: MEREF-SFD suivis de 6 caractères et 4 chiffres. 
        Exemple: MEREF-SFDABC123-4567
      </div>
    </div>
  );
};
