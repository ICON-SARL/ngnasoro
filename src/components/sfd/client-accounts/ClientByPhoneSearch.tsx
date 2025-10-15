import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, Search, UserCheck, X } from 'lucide-react';
import { useClientByPhone, ClientSearchResult } from '@/hooks/sfd/useClientByPhone';
import { Loader } from '@/components/ui/loader';
import ClientDetailsView from '../client-details/ClientDetailsView';
import { SfdClient } from '@/types/sfdClients';

const ClientByPhoneSearch: React.FC = () => {
  const [phoneInput, setPhoneInput] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const { client, isLoading, searchClient } = useClientByPhone();

  const handleSearch = () => {
    if (phoneInput.trim()) {
      searchClient(phoneInput.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClear = () => {
    setPhoneInput('');
    setShowDetails(false);
  };
  
  const getClientForView = (client: ClientSearchResult | null): SfdClient | null => {
    if (!client) return null;
    
    if (!('isNewClient' in client)) {
      return client as SfdClient;
    }
    
    return {
      id: 'new-client-' + Date.now(),
      full_name: client.full_name,
      email: client.email,
      phone: client.phone,
      user_id: client.user_id,
      sfd_id: '',
      status: 'pending',
      created_at: new Date().toISOString()
    };
  };

  const clientForView = getClientForView(client);

  return (
    <div className="space-y-6">
      {!showDetails ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Phone className="h-5 w-5 mr-2 text-[#0D6A51]" />
              Recherche par téléphone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Numéro de téléphone</Label>
                <div className="flex">
                  <Input
                    id="phone"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="Ex: 77123456"
                    className="flex-1"
                    onKeyDown={handleKeyDown}
                  />
                  {phoneInput && (
                    <Button
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      onClick={handleClear}
                      className="ml-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    type="button" 
                    className="ml-2 bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                    onClick={handleSearch}
                    disabled={isLoading || !phoneInput}
                  >
                    {isLoading ? <Loader size="sm" /> : <Search className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <Loader size="md" />
                </div>
              ) : client ? (
                <div className="mt-4 p-4 border rounded-md bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium flex items-center">
                        <UserCheck className="h-4 w-4 mr-2 text-green-600" />
                        {client.full_name}
                      </h3>
                      <p className="text-sm text-gray-500">{'phone' in client ? client.phone : ''}</p>
                    </div>
                    <Button 
                      onClick={() => setShowDetails(true)}
                      className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                    >
                      Voir détails
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : clientForView ? (
        <ClientDetailsView
          client={clientForView}
          onClose={() => setShowDetails(false)}
        />
      ) : null}
    </div>
  );
};

export default ClientByPhoneSearch;
