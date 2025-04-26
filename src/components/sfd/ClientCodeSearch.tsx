
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatClientCode, validateClientCode } from '@/utils/clientCodeUtils';

interface ClientCodeSearchProps {
  onClientFound: (client: any) => void;
}

export const ClientCodeSearch: React.FC<ClientCodeSearchProps> = ({ onClientFound }) => {
  const [clientCode, setClientCode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientCode.trim()) {
      toast({
        title: "Code client requis",
        description: "Veuillez saisir un code client",
        variant: "destructive",
      });
      return;
    }
    
    // Format the entered code
    const formattedCode = formatClientCode(clientCode);
    
    // Validate the code format
    if (!validateClientCode(formattedCode)) {
      toast({
        title: "Format de code invalide",
        description: "Le code client doit avoir le format SFD-XXXXXX-0000",
        variant: "destructive",
      });
      return;
    }
    
    setIsSearching(true);
    try {
      // First check in sfd_clients table
      const { data: clientData, error: clientError } = await supabase
        .from('sfd_clients')
        .select('*')
        .eq('client_code', formattedCode)
        .single();
        
      if (clientData) {
        onClientFound(clientData);
        toast({
          title: "Client trouvé",
          description: `Client ${clientData.full_name} trouvé`,
        });
        return;
      }
      
      // If not in clients, check in adhesion requests
      const { data: adhesionData, error: adhesionError } = await supabase
        .from('client_adhesion_requests')
        .select('*')
        .eq('client_code', formattedCode)
        .single();
        
      if (adhesionData) {
        onClientFound(adhesionData);
        toast({
          title: "Demande d'adhésion trouvée",
          description: `Demande pour ${adhesionData.full_name} trouvée`,
        });
        return;
      }
      
      // If not found anywhere
      toast({
        title: "Client non trouvé",
        description: "Aucun client ou demande trouvé avec ce code",
        variant: "destructive",
      });
      
    } catch (error) {
      console.error('Error searching for client:', error);
      toast({
        title: "Erreur de recherche",
        description: "Une erreur est survenue lors de la recherche du client",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
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
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
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
  );
};
