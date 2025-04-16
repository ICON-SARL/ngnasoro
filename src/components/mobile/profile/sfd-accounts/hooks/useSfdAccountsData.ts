
import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import { SfdAccountDisplay } from '../types/SfdAccountTypes';

export default function useSfdAccountsData(
  propsSfdData?: any[],
  propsActiveSfdId?: string | null
) {
  const { activeSfdId: authActiveSfdId } = useAuth();
  const { sfdAccounts, isLoading, refetch } = useSfdAccounts();
  
  const effectiveActiveSfdId = propsActiveSfdId !== undefined ? propsActiveSfdId : authActiveSfdId;

  // Transform SfdData to SfdAccountDisplay
  const transformSfdData = (data: any[]): SfdAccountDisplay[] => {
    if (!data || !Array.isArray(data)) {
      console.log('Invalid SFD data format:', data);
      return [];
    }
    
    return data.map(sfd => {
      if (!sfd) return null;
      
      return {
        id: sfd.id || '',
        name: sfd.name || 'Nom inconnu',
        balance: typeof sfd.balance === 'number' ? sfd.balance : 0,
        currency: sfd.currency || 'FCFA',
        code: sfd.code || '',
        region: sfd.region || '',
        logo_url: sfd.logoUrl || sfd.logo_url || null,
        is_default: Boolean(sfd.isDefault || sfd.is_default),
        isVerified: Boolean(sfd.isVerified || true),
        status: sfd.status || 'active'
      };
    }).filter(Boolean);
  };

  // Determine which data source to use
  const displayAccounts = useMemo(() => {
    if (propsSfdData && Array.isArray(propsSfdData) && propsSfdData.length > 0) {
      return transformSfdData(propsSfdData);
    }
    
    if (sfdAccounts && Array.isArray(sfdAccounts) && sfdAccounts.length > 0) {
      return transformSfdData(sfdAccounts);
    }
    
    return [];
  }, [propsSfdData, sfdAccounts]);

  return {
    displayAccounts,
    effectiveActiveSfdId,
    isLoading,
    refetch
  };
}
