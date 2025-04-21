
import { useUserMobileMoneyWebhooks } from './mobile-money/useUserMobileMoneyWebhooks';
import { useMobileMoneyWebhooks } from './mobile-money/useMobileMoneyWebhooks';
import { useMobileMoneySettings } from './mobile-money/useMobileMoneySettings';

export function useMobileMoney() {
  const { 
    mobileMoneyWebhooks, 
    isLoadingWebhooks, 
    markWebhookAsProcessed, 
    markWebhookAsFailed, 
    refetchWebhooks 
  } = useMobileMoneyWebhooks();
  
  const { 
    userMobileMoneyWebhooks, 
    isLoadingUserWebhooks, 
    refetchUserWebhooks 
  } = useUserMobileMoneyWebhooks();
  
  const { 
    mobileMoneySettings, 
    isLoadingSettings, 
    updateSettings,  // This is the correct property name
    refetchSettings 
  } = useMobileMoneySettings();

  return {
    // Données
    mobileMoneyWebhooks,
    userMobileMoneyWebhooks,
    mobileMoneySettings,
    
    // État des requêtes
    isLoadingWebhooks,
    isLoadingUserWebhooks,
    isLoadingSettings,
    
    // Mutations
    markWebhookAsProcessed,
    markWebhookAsFailed,
    updateSettings,  // Use the correct property name
    
    // Rechargement manuel
    refetchWebhooks,
    refetchUserWebhooks,
    refetchSettings,
  };
}
