
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { handleError } from '@/utils/errorHandler';
import { useAuth } from '@/hooks/auth';

export interface PaginationParams {
  page: number;
  pageSize: number;
  status?: string;
}

export function usePaginatedLoans(sfdId: string, initialParams: PaginationParams = { page: 1, pageSize: 10 }) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [params, setParams] = useState<PaginationParams>(initialParams);

  const fetchLoans = async ({ page, pageSize, status }: PaginationParams) => {
    try {
      if (!session) throw new Error("Authentification requise");

      const response = await supabase.functions.invoke('sfd-admin-loans', {
        headers: {
          'x-sfd-id': sfdId,
          'x-page': page.toString(),
          'x-page-size': pageSize.toString(),
        },
        body: { status },
      });

      if (!response.data.success) {
        throw new Error(response.data.error || "Erreur lors de la récupération des prêts");
      }

      return response.data;
    } catch (error) {
      handleError(error, session?.user?.id);
      throw error;
    }
  };

  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['sfd-loans', sfdId, params],
    queryFn: () => fetchLoans(params),
    enabled: !!session && !!sfdId,
  });

  // Gestion de la pagination
  const handlePageChange = (newPage: number) => {
    setParams(prev => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setParams(prev => ({ ...prev, pageSize: newPageSize, page: 1 }));
  };

  const handleStatusFilter = (status?: string) => {
    setParams(prev => ({ ...prev, status, page: 1 }));
  };

  // Fonction pour invalider le cache manuellement
  const invalidateLoansCache = () => {
    queryClient.invalidateQueries({ queryKey: ['sfd-loans', sfdId] });
  };

  return {
    loans: data?.data || [],
    pagination: data?.pagination || { page: 1, pageSize: 10, totalPages: 0, totalCount: 0 },
    isLoading,
    isError,
    error,
    refetch,
    invalidateLoansCache,
    handlePageChange,
    handlePageSizeChange,
    handleStatusFilter,
    currentPage: params.page,
    currentPageSize: params.pageSize,
    currentStatus: params.status
  };
}
