
import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import { SfdAccountDisplay } from '@/types/sfdAccounts';

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
      balance: 0, // Default values since SfdData doesn't include these
      currency: 'FCFA',
    }));
  };

  // Transform sfdAccounts to SfdAccountDisplay
  const transformSfdAccounts = (): SfdAccountDisplay[] => {
    if (!sfdAccounts || sfdAccounts.length === 0) {
      // Return mock data if no accounts found
      return [{
        id: 'default-sfd',
        name: 'Mon Compte SFD',
        logoUrl: undefined,
        region: 'Centrale',
        code: 'SFD',
        isDefault: true,
        balance: 250000,
        currency: 'FCFA',
        isVerified: true
      }];
    }
    
    return sfdAccounts.map(acc => ({
      id: acc.id,
      name: acc.name,
      logoUrl: acc.logoUrl,
      region: acc.region,
      code: acc.code,
      isDefault: acc.isDefault,
      balance: acc.balance || 0,
      currency: acc.currency || 'FCFA',
      isVerified: true // Ensure all accounts are shown as verified
    }));
  };

  // Transform the data to our common format
  const displayAccounts: SfdAccountDisplay[] = useMemo(() => {
    return propsSfdData 
      ? transformSfdData(propsSfdData)
      : transformSfdAccounts();
  }, [propsSfdData, sfdAccounts]);

  return {
    sfdAccounts,
    effectiveActiveSfdId: effectiveActiveSfdId || (displayAccounts.length > 0 ? displayAccounts[0].id : null),
    displayAccounts,
    isLoading,
    refetch
  };
}
