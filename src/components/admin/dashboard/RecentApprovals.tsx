
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RecentApproval } from '@/hooks/useAdminDashboardData';

interface RecentApprovalsProps {
  approvals?: RecentApproval[];
  isLoading?: boolean;
}

export const RecentApprovals: React.FC<RecentApprovalsProps> = ({ 
  approvals = [], 
  isLoading = false 
}) => {
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' XOF';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Approbations récentes</CardTitle>
        <CardDescription>Dernières demandes approuvées</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-4 text-center text-gray-500">Chargement des approbations...</div>
        ) : approvals.length === 0 ? (
          <div className="py-4 text-center text-gray-500">Aucune approbation récente</div>
        ) : (
          <div className="space-y-2">
            {approvals.map((approval) => (
              <div key={approval.id} className="flex justify-between items-center py-2 border-b last:border-0">
                <div>
                  <div className="font-medium">{approval.sfd_name}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{formatCurrency(approval.amount)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
