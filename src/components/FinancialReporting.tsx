
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQueryClient } from '@tanstack/react-query';
import { useSfdDashboardStats } from '@/hooks/useSfdDashboardStats';
import { Loader2 } from 'lucide-react';

export function FinancialReporting() {
  const queryClient = useQueryClient();
  const { data: stats, isLoading } = useSfdDashboardStats();
  
  // Refresh dashboard stats when this component is mounted
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['sfd-dashboard-stats'] });
  }, [queryClient]);
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' FCFA';
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <p>Chargement des données financières...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Rapport Financier</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="border p-4 rounded-md">
                <h3 className="text-sm font-medium text-muted-foreground">Total des Prêts Actifs</h3>
                <p className="text-2xl font-bold">{formatCurrency(stats?.loans.totalAmount || 0)}</p>
              </div>
              <div className="border p-4 rounded-md">
                <h3 className="text-sm font-medium text-muted-foreground">Remboursements ce mois</h3>
                <p className="text-2xl font-bold">{formatCurrency(stats?.repayments.currentMonth || 0)}</p>
              </div>
            </div>
            
            <div className="border p-4 rounded-md">
              <h3 className="text-sm font-medium text-muted-foreground">Taux de Remboursement</h3>
              <div className="h-4 bg-gray-200 rounded-full mt-2">
                <div 
                  className="h-4 bg-green-500 rounded-full" 
                  style={{ width: `${stats?.repayments.repaymentRate || 0}%` }}
                ></div>
              </div>
              <p className="text-right text-sm mt-1">{stats?.repayments.repaymentRate || 0}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
