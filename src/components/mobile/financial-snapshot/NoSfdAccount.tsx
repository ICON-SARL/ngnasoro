
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DiscoverSfdDialog from '../profile/sfd-accounts/DiscoverSfdDialog';
import { useToast } from '@/hooks/use-toast';

interface NoSfdAccountProps {
  onConnect: () => void;
}

const NoSfdAccount: React.FC<NoSfdAccountProps> = ({ onConnect }) => {
  const [discoverOpen, setDiscoverOpen] = useState(false);
  const { toast } = useToast();

  const handleRequestSent = () => {
    toast({
      title: "Demande envoyée",
      description: "Votre demande a été envoyée avec succès. Vous serez notifié lorsqu'elle sera traitée.",
    });
  };

  return (
    <>
      <Card className="border-0 shadow-md bg-white rounded-2xl overflow-hidden">
        <CardContent className="p-4">
          <div className="flex flex-col items-center text-center py-4">
            <AlertCircle className="h-12 w-12 text-amber-500 mb-2" />
            <h3 className="text-lg font-medium mb-2">Pas de compte SFD</h3>
            <p className="text-gray-500 mb-4">
              Vous n'avez pas encore de compte auprès d'un SFD partenaire
            </p>
            <Button 
              className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
              onClick={() => setDiscoverOpen(true)}
            >
              Découvrir les SFDs
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <DiscoverSfdDialog 
        isOpen={discoverOpen} 
        onOpenChange={setDiscoverOpen} 
        onRequestSent={handleRequestSent}
      />
    </>
  );
};

export default NoSfdAccount;
