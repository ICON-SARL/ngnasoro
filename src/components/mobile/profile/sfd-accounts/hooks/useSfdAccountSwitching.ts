
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeSynchronization } from '@/hooks/useRealtimeSynchronization';

export default function useSfdAccountSwitching(onSwitchSfd?: (sfdId: string) => Promise<boolean> | void) {
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();
  const { setActiveSfdId } = useAuth();
  const { synchronizeWithSfd } = useRealtimeSynchronization();
  
  const handleSwitchSfd = async (sfdId: string) => {
    try {
      setSwitchingId(sfdId);
      setIsVerifying(true);
      
      if (onSwitchSfd) {
        // Use provided callback
        const result = await onSwitchSfd(sfdId);
        
        if (result !== false) {
          setActiveSfdId(sfdId);
          toast({
            title: "SFD modifiée",
            description: "Votre compte SFD principal a été modifié"
          });
          
          // Force sync after switching
          await synchronizeWithSfd(true);
        }
      } else {
        // Default implementation
        setActiveSfdId(sfdId);
        toast({
          title: "SFD modifiée",
          description: "Votre compte SFD principal a été modifié"
        });
        
        // Force sync after switching
        await synchronizeWithSfd(true);
      }
    } catch (error) {
      console.error('Error switching SFD:', error);
      toast({
        title: "Erreur",
        description: "Impossible de changer de SFD pour le moment",
        variant: "destructive"
      });
    } finally {
      setSwitchingId(null);
      setIsVerifying(false);
    }
  };
  
  return {
    switchingId,
    isVerifying,
    handleSwitchSfd
  };
}
