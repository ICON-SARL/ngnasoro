
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';

export interface SfdAccountDisplay {
  id: string;
  name: string;
  logo?: string;
  balance: number;
  currency: string;
  isActive: boolean;
}

export default function useSfdAccountsData(propsSfdData?: any[], propsActiveSfdId?: string | null) {
  const [displayAccounts, setDisplayAccounts] = useState<SfdAccountDisplay[]>([]);
  const { activeSfdId: authActiveSfdId } = useAuth();
  const { accounts: hookAccounts, isLoading: hookIsLoading } = useSfdAccounts();
  
  // Determine effective SFD ID and accounts data
  const effectiveActiveSfdId = propsActiveSfdId !== undefined 
    ? propsActiveSfdId 
    : authActiveSfdId;

  const effectiveSfdData = propsSfdData || hookAccounts;
  const isLoading = hookIsLoading && !propsSfdData;
  
  useEffect(() => {
    if (!effectiveSfdData) {
      setDisplayAccounts([]);
      return;
    }
    
    // Transform accounts data to display format
    const formatted = effectiveSfdData.map((sfd: any) => ({
      id: sfd.id || sfd.sfds?.id,
      name: sfd.name || sfd.sfds?.name,
      logo: sfd.logo_url || sfd.sfds?.logo_url,
      balance: sfd.balance || 0,
      currency: sfd.currency || 'FCFA',
      isActive: sfd.id === effectiveActiveSfdId || sfd.sfds?.id === effectiveActiveSfdId
    }));
    
    setDisplayAccounts(formatted);
  }, [effectiveSfdData, effectiveActiveSfdId]);
  
  // Function to refetch accounts data
  const refetch = async () => {
    if (propsSfdData) {
      return; // No need to refetch when data is provided via props
    }
    
    try {
      await useSfdAccounts().refetch();
      return true;
    } catch (error) {
      console.error('Failed to refetch SFD accounts', error);
      return false;
    }
  };
  
  return {
    displayAccounts,
    effectiveActiveSfdId,
    isLoading,
    refetch
  };
}
