
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Edit2, RefreshCw } from 'lucide-react';
import { handleError } from '@/utils/errorHandler';
import { supabase } from '@/integrations/supabase/client';

interface JoinSfdButtonProps {
  sfdId: string;
  sfdName: string;
  isRetry?: boolean;
  isEdit?: boolean;
  onClick?: () => void;
}

export const JoinSfdButton = ({ sfdId, sfdName, isRetry = false, isEdit = false, onClick }: JoinSfdButtonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleJoinRequest = async (e: React.MouseEvent) => {
    // Prevent event propagation to avoid unwanted triggers
    e.preventDefault();
    e.stopPropagation();
    
    try {
      // If a custom onClick handler is provided, use it instead
      if (onClick) {
        onClick();
        return;
      }
      
      if (!user) {
        toast({
          title: 'Erreur',
          description: "Vous devez être connecté pour envoyer une demande d'adhésion",
          variant: 'destructive',
        });
        navigate('/auth');
        return;
      }

      // If it's an edit/modification, navigate directly without deleting the request
      if (isEdit) {
        console.log(`Editing request for SFD: ${sfdId}`);
        navigate(`/mobile-flow/sfd-adhesion/${sfdId}?mode=edit`, {
          state: { 
            sfdId: sfdId,
            sfdName: sfdName
          }
        });
        return;
      }

      // If retrying after rejection, delete the old request
      if (isRetry) {
        console.log(`Deleting rejected request for SFD: ${sfdId}`);
        
        const { error: deleteError } = await supabase
          .from('client_adhesion_requests')
          .delete()
          .eq('user_id', user.id)
          .eq('sfd_id', sfdId)
          .eq('status', 'rejected');
          
        if (deleteError) {
          console.error('Error deleting previous request:', deleteError);
          toast({
            title: 'Erreur',
            description: "Impossible de réinitialiser votre demande précédente",
            variant: 'destructive',
          });
          return;
        }
        
        toast({
          title: 'Demande réinitialisée',
          description: "Vous pouvez maintenant soumettre une nouvelle demande",
        });
      }
      
      console.log(`Navigating to adhesion page for SFD: ${sfdId} (${sfdName})`);
      
      // Navigate with state to ensure context is preserved
      navigate(`/mobile-flow/sfd-adhesion/${sfdId}`, {
        state: { 
          sfdId: sfdId,
          sfdName: sfdName
        }
      });
      
    } catch (err) {
      console.error('Error processing request:', err);
      handleError(err);
    }
  };

  return (
    <Button 
      onClick={handleJoinRequest}
      className={`w-full ${isRetry 
        ? 'bg-red-600 hover:bg-red-700' 
        : isEdit 
          ? 'bg-amber-600 hover:bg-amber-700'
          : 'bg-[#0D6A51] hover:bg-[#0D6A51]/90'}`}
    >
      {isRetry ? (
        <>
          <RefreshCw className="mr-2 h-4 w-4" /> Réessayer
        </>
      ) : isEdit ? (
        <>
          <Edit2 className="mr-2 h-4 w-4" /> Modifier
        </>
      ) : (
        <>
          Rejoindre <ArrowRight className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
};
