
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const JoinSfdButton = ({ sfdId, sfdName }: { sfdId: string; sfdName: string }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const handleJoinRequest = async () => {
    try {
      if (!user) {
        toast({
          title: 'Erreur',
          description: 'Vous devez être connecté pour envoyer une demande d\'adhésion',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('client_adhesion_requests')
        .insert({
          user_id: user.id,
          sfd_id: sfdId,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
          email: user.email,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: 'Demande envoyée',
        description: `Votre demande d'adhésion à ${sfdName} a été envoyée avec succès`,
      });
    } catch (err) {
      console.error('Error sending join request:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer votre demande d\'adhésion',
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
