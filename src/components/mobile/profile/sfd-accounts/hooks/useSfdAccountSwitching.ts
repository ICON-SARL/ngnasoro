
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export default function useSfdAccountSwitching(
  onSwitchSfd?: (sfdId: string) => Promise<boolean> | void
) {
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [pendingSfdId, setPendingSfdId] = useState<string | null>(null);
  const [pendingSfdName, setPendingSfdName] = useState('');
  const { toast } = useToast();
  const { setActiveSfdId } = useAuth();

  const handleSwitchSfd = useCallback(async (sfdId: string) => {
    if (isVerifying) return;
    
    setSwitchingId(sfdId);
    
    try {
      if (onSwitchSfd) {
        // Use provided switch function from props
        const result = await onSwitchSfd(sfdId);
        
        if (result === false) {
          // If onSwitchSfd returns false, we'll show verification dialog
          setPendingSfdId(sfdId);
          setVerificationRequired(true);
          return;
        }
      } else {
        // Default behavior - direct switch
        setActiveSfdId(sfdId);
        toast({
          title: "Compte SFD changé",
          description: "Vous avez changé de compte SFD",
        });
      }
    } catch (error) {
      console.error("Error switching SFD:", error);
      toast({
        title: "Erreur",
        description: "Impossible de changer de compte SFD",
        variant: "destructive",
      });
    } finally {
      setSwitchingId(null);
    }
  }, [isVerifying, onSwitchSfd, setActiveSfdId, toast]);

  const handleVerificationComplete = useCallback(async (code: string) => {
    if (!pendingSfdId) return false;
    
    setIsVerifying(true);
    
    try {
      // Here you would validate the verification code with the backend
      // For now we'll simulate success
      setActiveSfdId(pendingSfdId);
      
      toast({
        title: "Compte SFD vérifié",
        description: "Vous avez changé de compte SFD avec succès",
      });
      
      setVerificationRequired(false);
      setPendingSfdId(null);
      setPendingSfdName('');
      
      return true;
    } catch (error) {
      console.error("Error verifying SFD switch:", error);
      toast({
        title: "Erreur de vérification",
        description: "Le code de vérification est invalide",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsVerifying(false);
    }
  }, [pendingSfdId, setActiveSfdId, toast]);

  const cancelSwitch = useCallback(() => {
    setVerificationRequired(false);
    setPendingSfdId(null);
    setPendingSfdName('');
    setSwitchingId(null);
    setIsVerifying(false);
  }, []);

  return {
    switchingId,
    isVerifying,
    verificationRequired,
    pendingSfdId,
    pendingSfdName,
    handleSwitchSfd,
    handleVerificationComplete,
    cancelSwitch
  };
}
