
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSecureStorage } from '@/hooks/useSecureStorage';

export const useOfflineMode = () => {
  const [isOffline, setIsOffline] = useState(false);
  const { toast } = useToast();
  const { value: storedValue, setValue } = useSecureStorage('offline-mode', 'offline-mode-key');

  useEffect(() => {
    // Initialize from stored value
    setIsOffline(!!storedValue);

    // Listen for online/offline events
    const handleOnline = () => {
      toast({
        title: "Connexion rétablie",
        description: "Vous êtes maintenant en ligne",
      });
    };

    const handleOffline = () => {
      toast({
        title: "Mode hors-ligne",
        description: "Vous êtes passé en mode hors-ligne",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast, storedValue]);

  const toggleOfflineMode = (enabled: boolean) => {
    setIsOffline(enabled);
    setValue(enabled);
  };

  return {
    isOffline,
    toggleOfflineMode
  };
};
