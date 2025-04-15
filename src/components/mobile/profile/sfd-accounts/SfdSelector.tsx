
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAvailableSfds } from '@/hooks/sfd/useAvailableSfds';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface SfdSelectorProps {
  userId: string;
  onRequestSent?: () => void;
}

const SfdSelector: React.FC<SfdSelectorProps> = ({ userId, onRequestSent }) => {
  const [selectedSfd, setSelectedSfd] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const {
    availableSfds,
    pendingRequests,
    isLoading,
    requestSfdAccess
  } = useAvailableSfds(userId);
  
  // Function to sort SFDs with priority
  const sortPrioritySfds = (sfds: any[]) => {
    const prioritySfdNames = ["premier sfd", "deuxieme", "troisieme"];
    
    return [...sfds].sort((a, b) => {
      const aIsPriority = prioritySfdNames.includes(a.name.toLowerCase());
      const bIsPriority = prioritySfdNames.includes(b.name.toLowerCase());
      
      if (aIsPriority && !bIsPriority) return -1;
      if (!aIsPriority && bIsPriority) return 1;
      
      if (aIsPriority && bIsPriority) {
        return prioritySfdNames.indexOf(a.name.toLowerCase()) - prioritySfdNames.indexOf(b.name.toLowerCase());
      }
      
      return a.name.localeCompare(b.name);
    });
  };
  
  // Sort availableSfds to prioritize specific SFDs
  const sortedSfds = sortPrioritySfds(availableSfds);
  
  const handleRequestAccess = async () => {
    if (!selectedSfd) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une SFD",
        variant: "destructive"
      });
      return;
    }
    
    setIsSending(true);
    
    try {
      const success = await requestSfdAccess(selectedSfd, phoneNumber);
      if (success && onRequestSent) {
        onRequestSent();
        setSelectedSfd(null);
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {pendingRequests?.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium text-lg mb-2">Demandes en cours</h3>
              <div className="space-y-2">
                {pendingRequests.map(request => (
                  <Card key={request.id} className="bg-amber-50 border-amber-200">
                    <CardContent className="p-3 flex justify-between items-center">
                      <div>
                        <p className="font-medium">Demande en attente</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs">
                          En attente
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {sortedSfds.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">Aucune SFD disponible pour le moment.</p>
              <p className="text-sm text-gray-500 mt-1">
                Toutes les SFDs sont déjà associées à votre compte ou en attente de validation.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <h3 className="font-medium text-lg">SFDs disponibles</h3>
                <div className="grid gap-3">
                  {sortedSfds.map(sfd => (
                    <Card 
                      key={sfd.id}
                      className={`cursor-pointer border transition-colors ${
                        selectedSfd === sfd.id 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedSfd(sfd.id)}
                    >
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center">
                          {sfd.logo_url ? (
                            <img 
                              src={sfd.logo_url} 
                              alt={sfd.name} 
                              className="h-10 w-10 mr-3 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 mr-3 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="font-bold text-primary">{sfd.name.charAt(0)}</span>
                            </div>
                          )}
                          <div>
                            <h4 className="font-medium">{sfd.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {sfd.region || sfd.code}
                            </p>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 ${
                          selectedSfd === sfd.id 
                            ? 'border-primary bg-primary' 
                            : 'border-gray-300'
                        }`}/>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              {selectedSfd && (
                <div className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                      Numéro de téléphone (facultatif)
                    </label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="+223 7X XX XX XX"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Votre numéro aidera la SFD à vous identifier
                    </p>
                  </div>
                  
                  <Button
                    onClick={handleRequestAccess}
                    disabled={isSending}
                    className="w-full"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      "Envoyer une demande d'accès"
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default SfdSelector;
