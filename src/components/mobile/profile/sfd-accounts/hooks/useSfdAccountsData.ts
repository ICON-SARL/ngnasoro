
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
    return data.map(sfd => ({
      id: sfd.id,
      name: sfd.name,
      balance: sfd.balance || 0,
      currency: sfd.currency || 'FCFA',
      code: sfd.code || '',
      region: sfd.region || '',
      logoUrl: sfd.logoUrl || sfd.logo_url || null,
      isDefault: sfd.isDefault || sfd.is_default || false,
      isVerified: true
    }));
  };

  // Determine which data source to use
  const displayAccounts = useMemo(() => {
    if (propsSfdData && propsSfdData.length > 0) {
      return transformSfdData(propsSfdData);
    }
    
    return transformSfdData(sfdAccounts);
  }, [propsSfdData, sfdAccounts]);

  return {
    displayAccounts,
    effectiveActiveSfdId,
    isLoading,
    refetch
  };
}
