
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAvailableSfds } from '@/hooks/sfd/useAvailableSfds';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader } from '@/components/ui/loader';
import { Check, Search, Building2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const AvailableSfdsList = () => {
  const { user } = useAuth();
  const { availableSfds, pendingRequests, isLoading, requestSfdAccess } = useAvailableSfds(user?.id);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSfd, setSelectedSfd] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  
  const filteredSfds = availableSfds.filter(sfd => 
    sfd.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    sfd.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sfd.region?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleRequestAccess = async () => {
    if (!selectedSfd || !user?.id) return;
    
    setIsSending(true);
    try {
      await requestSfdAccess(selectedSfd);
      setSelectedSfd(null);
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <Card className="font-montserrat">
      <CardHeader>
        <CardTitle className="text-xl text-[#0D6A51]">SFDs disponibles</CardTitle>
        <CardDescription>
          Choisissez la SFD dont vous êtes client. L'administrateur de la SFD validera votre demande.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {pendingRequests.length > 0 && (
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-md border border-blue-200 mb-2">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800 font-medium">
                Demandes en attente
              </p>
              <p className="text-sm text-blue-700">
                Vous avez {pendingRequests.length} demande(s) en cours de traitement.
              </p>
            </div>
          </div>
        )}
      
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader size="lg" />
          </div>
        ) : (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Rechercher une SFD..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {filteredSfds.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                <p>Aucune SFD trouvée</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {filteredSfds.map((sfd) => (
                  <div
                    key={sfd.id}
                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedSfd === sfd.id 
                        ? 'bg-[#0D6A51]/10 border-[#0D6A51]/30' 
                        : 'hover:bg-gray-50 border-gray-200'
                    }`}
                    onClick={() => setSelectedSfd(sfd.id)}
                  >
                    <div>
                      <p className="font-medium">{sfd.name}</p>
                      <div className="flex text-sm text-muted-foreground gap-2">
                        {sfd.code && <span>Code: {sfd.code}</span>}
                        {sfd.region && <span>• {sfd.region}</span>}
                      </div>
                    </div>
                    
                    {selectedSfd === sfd.id && (
                      <Check className="h-5 w-5 text-[#0D6A51]" />
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <Button 
              className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90 mt-4"
              onClick={handleRequestAccess}
              disabled={!selectedSfd || isSending}
            >
              {isSending ? (
                <>
                  <Loader size="sm" className="mr-2 text-white" />
                  Envoi en cours...
                </>
              ) : (
                "Envoyer la demande d'accès"
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AvailableSfdsList;
