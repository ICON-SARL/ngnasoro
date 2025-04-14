
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { subsidyApi } from '@/utils/subsidyApi';
import { SfdSubsidy } from '@/hooks/sfd/types';
import { useAuth } from '@/hooks/useAuth';

export interface CreateSubsidyParams {
  sfd_id: string;
  amount: number;
  description?: string;
  end_date?: string;
}

export function useSubsidies() {
  const { user } = useAuth();
  const [selectedSubsidy, setSelectedSubsidy] = useState<SfdSubsidy | null>(null);
  
  // Fetch all subsidies
  const { data: subsidies = [], isLoading, refetch } = useQuery({
    queryKey: ['subsidies'],
    queryFn: subsidyApi.getAllSubsidies
  });
  
  // Fetch all SFDs for dropdown
  const { data: sfds = [] } = useQuery({
    queryKey: ['sfds'],
    queryFn: subsidyApi.getAllSfds
  });
  
  // Create new subsidy
  const createSubsidy = useMutation({
    mutationFn: async (subsidy: CreateSubsidyParams) => {
      if (!user) throw new Error('User not authenticated');
      
      return subsidyApi.createSubsidy({
        ...subsidy,
        allocated_by: user.id
      });
    },
    onSuccess: () => {
      refetch();
    }
  });
  
  // Revoke subsidy
  const revokeSubsidy = useMutation({
    mutationFn: async ({ subsidyId, reason }: { subsidyId: string, reason?: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      return subsidyApi.revokeSubsidy(subsidyId, user.id, reason);
    },
    onSuccess: () => {
      refetch();
    }
  });
  
  return {
    subsidies,
    sfds,
    isLoading,
    createSubsidy,
    revokeSubsidy,
    selectedSubsidy,
    setSelectedSubsidy
  };
}
