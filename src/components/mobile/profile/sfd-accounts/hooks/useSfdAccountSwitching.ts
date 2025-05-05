import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export default function useSfdAccountSwitching(onSwitchSfd?: (sfdId: string) => Promise<boolean> | void) {
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();
  const { setActiveSfdId } = useAuth();
  
  const handleSwitchSfd = async (sfdId: string) => {
    try {
      setSwitchingId(sfdId);
      setIsVerifying(true);
      
      if (onSwitchSfd) {
        // If custom handler provided, use it
        await onSwitchSfd(sfdId);
      } else if (setActiveSfdId) {
        // Otherwise use the default auth context handler
        setActiveSfdId(sfdId);
        
        toast({
          title: 'SFD changée avec succès',
          description: 'Votre SFD active a été mise à jour',
        });
        
        return true;
      }
    } catch (error: any) {
      console.error('Error switching SFD:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de changer de SFD',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
      setSwitchingId(null);
    }
  };

  return {
    switchingId,
    isVerifying,
    handleSwitchSfd,
  };
}
