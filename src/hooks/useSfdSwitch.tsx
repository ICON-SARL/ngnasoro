
import { useState } from 'react';
import { useAuth } from './useAuth';
import { verifySfdSwitch, completeSfdSwitch } from '@/utils/sfdSwitchVerifier';
import { useToast } from '@/hooks/use-toast';

export function useSfdSwitch() {
  const { user, setActiveSfdId } = useAuth();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);
  const [pendingSfdId, setPendingSfdId] = useState<string | null>(null);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);

  // Initiate the SFD switch process
  const initiateSwitch = async (sfdId: string) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour changer de SFD",
        variant: "destructive",
      });
      return false;
    }

    // Vérifier le rôle de l'utilisateur
    const userRole = user.app_metadata?.role;
    
    // Les admins SFD ne peuvent pas changer de SFD une fois attribuée
    if (userRole === 'sfd_admin' && user.app_metadata?.sfd_id) {
      toast({
        title: "Action non autorisée",
        description: "En tant qu'administrateur SFD, vous ne pouvez pas changer de SFD",
        variant: "destructive",
      });
      return false;
    }

    setIsVerifying(true);
    setPendingSfdId(sfdId);
    setPendingApproval(false);

    try {
      const verificationResult = await verifySfdSwitch(user.id, sfdId);
      
      if (!verificationResult.success) {
        if (verificationResult.requiresApproval) {
          setPendingApproval(true);
          toast({
            title: "Demande en cours",
            description: verificationResult.message,
          });
        } else {
          toast({
            title: "Erreur",
            description: verificationResult.message,
            variant: "destructive",
          });
        }
        setIsVerifying(false);
        return false;
      }
      
      if (verificationResult.requiresVerification) {
        setVerificationRequired(true);
        setVerificationId(verificationResult.verificationId || null);
        toast({
          title: "Vérification requise",
          description: "Veuillez confirmer le changement avec le code envoyé",
        });
        setIsVerifying(false);
        return true;
      } else {
        // No verification required, complete the switch directly
        return await completeSwitch();
      }
    } catch (error) {
      console.error("Error initiating SFD switch:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'initialisation du changement de SFD",
        variant: "destructive",
      });
      setIsVerifying(false);
      setPendingSfdId(null);
      return false;
    }
  };

  // Complete the switch with verification code if required
  const completeSwitch = async (verificationCode?: string) => {
    if (!user || !pendingSfdId) {
      toast({
        title: "Erreur",
        description: "Informations manquantes pour le changement de SFD",
        variant: "destructive",
      });
      return false;
    }

    setIsVerifying(true);

    try {
      const result = await completeSfdSwitch({
        userId: user.id,
        sfdId: pendingSfdId,
        verificationCode
      });

      if (result.success) {
        setActiveSfdId(pendingSfdId);
        toast({
          title: "Succès",
          description: result.message,
        });
        
        // Reset state
        setPendingSfdId(null);
        setVerificationId(null);
        setVerificationRequired(false);
        setIsVerifying(false);
        return true;
      } else {
        toast({
          title: "Erreur",
          description: result.message,
          variant: "destructive",
        });
        setIsVerifying(false);
        return false;
      }
    } catch (error) {
      console.error("Error completing SFD switch:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du changement de SFD",
        variant: "destructive",
      });
      setIsVerifying(false);
      return false;
    }
  };

  // Cancel the switch process
  const cancelSwitch = () => {
    setPendingSfdId(null);
    setVerificationId(null);
    setVerificationRequired(false);
    setIsVerifying(false);
    setPendingApproval(false);
  };

  return {
    isVerifying,
    pendingSfdId,
    verificationRequired,
    verificationId,
    pendingApproval,
    initiateSwitch,
    completeSwitch,
    cancelSwitch
  };
}
