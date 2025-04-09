
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useSfdClientStats } from '@/hooks/sfd/useSfdClientStats';
import { useSfdLoanStats } from '@/hooks/sfd/useSfdLoanStats';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, CreditCard, TrendingUp, Activity } from 'lucide-react';

export const SfdDashboardStats = () => {
  const { activeSfdId } = useAuth();
  const { clientStats, isLoading: isLoadingClients } = useSfdClientStats(activeSfdId);
  const { loanStats, isLoading: isLoadingLoans } = useSfdLoanStats(activeSfdId);
  
  // Get latest subsidy requests
  const { data: subsidyData, isLoading: isLoadingSubsidies } = useQuery({
    queryKey: ['subsidy-stats', activeSfdId],
    queryFn: async () => {
      if (!activeSfdId) return { pendingCount: 0, totalAmount: 0 };
      
      // Get pending subsidy requests count
      const { count: pendingCount, error: pendingError } = await supabase
        .from('subsidy_requests')
        .select('*', { count: 'exact', head: true })
        .eq('sfd_id', activeSfdId)
        .eq('status', 'pending');
      
      if (pendingError) throw pendingError;
      
      // Get total subsidy amount
      const { data, error } = await supabase
        .from('sfd_subsidies')
        .select('amount')
        .eq('sfd_id', activeSfdId);
        
      if (error) throw error;
      
      const totalAmount = data?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
      
      return { pendingCount: pendingCount || 0, totalAmount };
    },
    enabled: !!activeSfdId,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
  
  const isLoading = isLoadingClients || isLoadingLoans || isLoadingSubsidies;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoadingClients ? (
            <Skeleton className="h-7 w-20" />
          ) : (
            <>
              <div className="text-2xl font-bold">{clientStats.totalClients}</div>
              <p className="text-xs text-muted-foreground">
                {clientStats.activeClients} actifs, {clientStats.pendingClients} en attente
              </p>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Crédits Actifs</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoadingLoans ? (
            <Skeleton className="h-7 w-20" />
          ) : (
            <>
              <div className="text-2xl font-bold">{loanStats.activeLoans}</div>
              <p className="text-xs text-muted-foreground">
                sur {loanStats.totalLoans} crédits au total
              </p>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Montant Distribué</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoadingLoans ? (
            <Skeleton className="h-7 w-28" />
          ) : (
            <>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(loanStats.disbursedAmount)}
              </div>
              <p className="text-xs text-muted-foreground">
                sur {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(loanStats.totalLoanAmount)} total
              </p>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Demandes en Attente</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoadingSubsidies ? (
            <Skeleton className="h-7 w-20" />
          ) : (
            <>
              <div className="text-2xl font-bold">{subsidyData?.pendingCount || 0}</div>
              <p className="text-xs text-muted-foreground">
                Subventions: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(subsidyData?.totalAmount || 0)}
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
