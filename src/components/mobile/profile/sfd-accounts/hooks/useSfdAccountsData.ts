
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import { SfdAccountDisplay } from '../types/SfdAccountTypes';
import { supabase } from '@/integrations/supabase/client';

export default function useSfdAccountsData(propsSfdData?: any[], propsActiveSfdId?: string | null) {
  const [displayAccounts, setDisplayAccounts] = useState<SfdAccountDisplay[]>([]);
  const { activeSfdId: authActiveSfdId, user } = useAuth();
  const { 
    accounts: hookAccounts, 
    isLoading: hookIsLoading,
    refetch,
    refetchAccounts 
  } = useSfdAccounts();
  
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
    
    // Also check if the user is a validated client to ensure showing all relevant accounts
    const checkClientAccounts = async () => {
      if (!user?.id) return;
      
      try {
        const { data: clientAccounts } = await supabase
          .from('sfd_clients')
          .select('id, sfd_id, sfds:sfd_id(id, name, logo_url)')
          .eq('user_id', user.id)
          .eq('status', 'validated');
          
        // Get balances for these accounts
        const { data: accountBalances } = await supabase
          .from('accounts')
          .select('sfd_id, balance, currency')
          .eq('user_id', user.id);
          
        // Combine the data
        const balanceMap = new Map();
        if (accountBalances) {
          accountBalances.forEach(acc => balanceMap.set(acc.sfd_id, { 
            balance: acc.balance || 0, 
            currency: acc.currency || 'FCFA' 
          }));
        }
        
        // Add any client accounts not already in effectiveSfdData
        const allAccounts = [...effectiveSfdData];
        const existingSfdIds = new Set(effectiveSfdData.map((acc: any) => acc.id));
        
        if (clientAccounts) {
          clientAccounts.forEach(client => {
            if (!existingSfdIds.has(client.sfds.id)) {
              const balanceInfo = balanceMap.get(client.sfds.id) || { balance: 0, currency: 'FCFA' };
              
              allAccounts.push({
                id: client.sfds.id,
                name: client.sfds.name,
                logo_url: client.sfds.logo_url,
                balance: balanceInfo.balance,
                currency: balanceInfo.currency,
                status: 'active',
                is_client: true
              });
            }
          });
        }
        
        // Transform accounts data to display format
        const formatted = allAccounts.map((sfd: any) => ({
          id: sfd.id || sfd.sfds?.id,
          name: sfd.name || sfd.sfds?.name,
          description: sfd.description || sfd.name || sfd.sfds?.name,
          logo: sfd.logo_url || sfd.sfds?.logo_url,
          logo_url: sfd.logo_url || sfd.sfds?.logo_url,
          balance: sfd.balance || 0,
          currency: sfd.currency || 'FCFA',
          isActive: sfd.id === effectiveActiveSfdId || sfd.sfds?.id === effectiveActiveSfdId,
          is_default: sfd.is_default || false,
          isVerified: sfd.status === 'active' || true,
          status: sfd.status || 'active',
          is_client: sfd.is_client || false
        }));
        
        setDisplayAccounts(formatted);
      } catch (error) {
        console.error('Error checking client accounts:', error);
      }
    };
    
    checkClientAccounts();
  }, [effectiveSfdData, effectiveActiveSfdId, user]);
  
  // Function to refetch accounts data
  const refetchAccountsData = async () => {
    if (propsSfdData) {
      return; // No need to refetch when data is provided via props
    }
    
    try {
      if (refetchAccounts) {
        await refetchAccounts();
      } else if (refetch) {
        await refetch();
      }
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
    refetch: refetchAccountsData
  };
}
