
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import { SfdAccountDisplay } from '../types/SfdAccountTypes';
import { sortSfdAccounts } from '../utils/accountSorter';

export default function useSfdAccountsData(propsSfdData?: any[], propsActiveSfdId?: string | null) {
  const { activeSfdId: authActiveSfdId } = useAuth();
  const { sfdAccounts, isLoading, refetch } = useSfdAccounts();
  const [displayAccounts, setDisplayAccounts] = useState<SfdAccountDisplay[]>([]);
  
  // Determine effective active SFD ID
  const effectiveActiveSfdId = propsActiveSfdId || authActiveSfdId;
  
  // Setup display accounts
  useEffect(() => {
    // Use props data if provided, otherwise use data from hook
    const dataSource = propsSfdData?.length ? propsSfdData : sfdAccounts;
    
    if (!dataSource?.length) {
      setDisplayAccounts([]);
      return;
    }
    
    // Map to SfdAccountDisplay format and sort them
    const formattedAccounts: SfdAccountDisplay[] = dataSource.map((acc: any) => ({
      id: acc.id,
      name: acc.name,
      balance: acc.balance || 0,
      logo_url: acc.logo_url || acc.logoUrl,
      currency: acc.currency || 'FCFA',
      code: acc.code || '',
      region: acc.region || '',
      description: acc.description || '',
      status: acc.status || 'active',
      isVerified: acc.isVerified !== undefined ? acc.isVerified : true,
      isActive: acc.id === effectiveActiveSfdId,
      is_default: acc.is_default || acc.isDefault || false
    }));
    
    // Sort accounts with active one first
    const sortedAccounts = sortSfdAccounts(formattedAccounts, effectiveActiveSfdId);
    setDisplayAccounts(sortedAccounts);
  }, [propsSfdData, sfdAccounts, effectiveActiveSfdId, isLoading]);
  
  return {
    displayAccounts,
    effectiveActiveSfdId,
    isLoading,
    refetch
  };
}
