
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight } from 'lucide-react';
import { handleError } from '@/utils/errorHandler';

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

      console.log(`Navigating to adhesion page for SFD: ${sfdId} (${sfdName})`);
      
      // Naviguer directement vers la page d'adhésion SFD avec l'ID de la SFD en préservant le préfixe mobile-flow
      navigate(`/mobile-flow/sfd-adhesion/${sfdId}`);
      
    } catch (err) {
      console.error('Error handling join request:', err);
      handleError(err);
    }
  };

  return (
    <Button 
      onClick={handleJoinRequest}
      className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
    >
      Demander l'adhésion <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  );
};
