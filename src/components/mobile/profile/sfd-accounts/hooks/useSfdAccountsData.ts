
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import { SfdAccountDisplay } from '../types/SfdAccountTypes';

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
      description: sfd.description || sfd.name || sfd.sfds?.name,
      logo: sfd.logo_url || sfd.sfds?.logo_url,
      logo_url: sfd.logo_url || sfd.sfds?.logo_url, // Added for compatibility
      balance: sfd.balance || 0,
      currency: sfd.currency || 'FCFA',
      isActive: sfd.id === effectiveActiveSfdId || sfd.sfds?.id === effectiveActiveSfdId,
      is_default: sfd.is_default || false,
      isVerified: sfd.status === 'active' || true,
      status: sfd.status || 'active' // Added for compatibility
    }));
    
    setDisplayAccounts(formatted);
  }, [effectiveSfdData, effectiveActiveSfdId]);
  
  // Function to refetch accounts data
  const refetch = async () => {
    if (propsSfdData) {
      return; // No need to refetch when data is provided via props
    }
    
    try {
      await useSfdAccounts().refetchAccounts();
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
