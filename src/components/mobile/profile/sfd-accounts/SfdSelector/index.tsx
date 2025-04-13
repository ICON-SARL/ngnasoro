
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAvailableSfds } from '@/hooks/sfd/useAvailableSfds';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SfdList from './SfdList';
import PendingRequestsList from './PendingRequestsList';
import PhoneNumberInput from './PhoneNumberInput';
import EmptyState from './EmptyState';
import LoadingState from './LoadingState';

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
        <LoadingState />
      ) : (
        <>
          {pendingRequests?.length > 0 && (
            <PendingRequestsList requests={pendingRequests} />
          )}
          
          {sortedSfds.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <SfdList 
                sfds={sortedSfds} 
                selectedSfdId={selectedSfd} 
                onSelect={setSelectedSfd} 
              />
              
              {selectedSfd && (
                <div className="mt-6 space-y-4">
                  <PhoneNumberInput 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  
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
