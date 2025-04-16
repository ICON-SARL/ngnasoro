
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const JoinSfdButton = ({ sfdId, sfdName }: { sfdId: string; sfdName: string }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleJoinRequest = () => {
    try {
      if (!user) {
        toast({
          title: 'Erreur',
          description: 'Vous devez être connecté pour envoyer une demande d\'adhésion',
          variant: 'destructive',
        });
        return;
      }

      // Navigate to the SFD adhesion page
      navigate(`/mobile-flow/sfd-adhesion/${sfdId}`);
      
    } catch (err) {
      console.error('Error handling join request:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de traiter votre demande d\'adhésion',
        variant: 'destructive',
      });
    }
  };

  return (
    <Button 
      onClick={handleJoinRequest}
      className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
    >
      Demander l'adhésion
    </Button>
  );
};
