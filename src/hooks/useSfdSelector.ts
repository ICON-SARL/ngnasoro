
import { useEffect } from 'react';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';
import { useToast } from '@/hooks/use-toast';

export function useSfdSelector(onEmptySfds?: () => void) {
  const { toast } = useToast();
  const { activeSfdId, setActiveSfdId, sfdData, isLoading } = useSfdDataAccess();
  
  useEffect(() => {
    if (!isLoading && sfdData.length === 0 && onEmptySfds) {
      onEmptySfds();
    }
  }, [sfdData, isLoading, onEmptySfds]);
  
  const handleSfdChange = (value: string) => {
    setActiveSfdId(value);
    
    const selectedSfd = sfdData.find(sfd => sfd.id === value);
    const sfdName = selectedSfd?.name || 'SFD Inconnue';
    
    toast({
      title: "SFD changée",
      description: `Vous êtes maintenant connecté à ${sfdName}`,
    });
  };
  
  return {
    activeSfdId,
    sfdData,
    isLoading,
    handleSfdChange
  };
}
