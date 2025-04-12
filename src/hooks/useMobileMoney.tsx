
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
    updateMobileMoneySettings, 
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
    updateMobileMoneySettings,
    
    // Rechargement manuel
    refetchWebhooks,
    refetchUserWebhooks,
    refetchSettings,
  };
}
