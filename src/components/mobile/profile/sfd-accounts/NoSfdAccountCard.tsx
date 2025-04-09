
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DiscoverSfdDialog from './DiscoverSfdDialog';
import { useAuth } from '@/hooks/useAuth';

interface NoSfdAccountCardProps {
  onDiscover?: () => void;
}

const NoSfdAccountCard: React.FC<NoSfdAccountCardProps> = ({ onDiscover }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
    if (onDiscover) onDiscover();
  };

  return (
    <Card className="mb-4 bg-white">
      <CardContent className="pt-6 pb-6 flex flex-col items-center">
        <h2 className="text-xl font-semibold mb-2 text-gray-800">Pas de compte SFD</h2>
        <p className="text-gray-600 text-center mb-6">
          Vous n'avez pas encore de compte auprès d'un SFD partenaire
        </p>
        
        <Button 
          onClick={handleOpenDialog}
          className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
        >
          Découvrir les SFDs
        </Button>
        
        <DiscoverSfdDialog 
          isOpen={isDialogOpen} 
          onOpenChange={setIsDialogOpen}
          onRequestSent={() => {
            setIsDialogOpen(false);
          }}
        />
      </CardContent>
    </Card>
  );
};

export default NoSfdAccountCard;
