
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { SubsidiesData } from '@/hooks/useAdminDashboardData';

interface SubsidySummaryProps {
  subsidiesData?: SubsidiesData;
  isLoading?: boolean;
}

export const SubsidySummary: React.FC<SubsidySummaryProps> = ({ 
  subsidiesData, 
  isLoading = false 
}) => {
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' XOF';
  };

  const totalAmount = subsidiesData?.totalAmount || 0;
  const availableAmount = subsidiesData?.availableAmount || 0;
  const usagePercentage = subsidiesData?.usagePercentage || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Montant Total</CardTitle>
        <CardDescription>Subventions allouées</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-end mb-2">
          <div className="text-3xl font-bold text-[#0D6A51] dark:text-green-400">
            {isLoading ? "..." : formatCurrency(totalAmount)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Alloué
          </div>
        </div>

        <h3 className="text-sm font-medium mt-6 mb-2">Utilisation des fonds</h3>
        <Progress value={usagePercentage} className="h-2 mb-2" />
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">{usagePercentage}%</span>
          <span className="text-gray-500">
            {isLoading ? "..." : formatCurrency(availableAmount)} disponible
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
