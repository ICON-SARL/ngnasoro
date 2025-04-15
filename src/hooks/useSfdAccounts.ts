
import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { useSfdList } from './sfd/useSfdList';

export function useSfdAccounts() {
  const { user } = useAuth();
  const { sfdAccounts, isLoading, isError, refetch } = useSfdList(user);
  
  return {
    sfdAccounts,
    isLoading,
    isError,
    refetch
  };
}
