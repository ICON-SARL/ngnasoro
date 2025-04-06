
import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import { SfdAccountDisplay } from '../AccountsList';

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
    return sfdAccounts.map(acc => ({
      id: acc.id,
      name: acc.name,
      logoUrl: acc.logoUrl,
      region: acc.region,
      code: acc.code,
      isDefault: acc.isDefault,
      balance: acc.balance,
      currency: acc.currency,
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
    effectiveActiveSfdId,
    displayAccounts,
    isLoading,
    refetch
  };
}
