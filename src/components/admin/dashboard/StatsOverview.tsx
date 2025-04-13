
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Users, CreditCard, TrendingUp, Wallet } from 'lucide-react';

const StatsOverview: React.FC = () => {
  const { activeSfdId, user } = useAuth();

  // This would typically fetch stats from your API
  const stats = {
    totalClients: 158,
    activeLoans: 42,
    totalRemboursements: 12500000,
    totalEpargne: 28750000,
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalClients}</div>
          <p className="text-xs text-muted-foreground">
            +12 depuis le mois dernier
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Prêts Actifs</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeLoans}</div>
          <p className="text-xs text-muted-foreground">
            +4 depuis le mois dernier
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Remboursements</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalRemboursements.toLocaleString()} FCFA</div>
          <p className="text-xs text-muted-foreground">
            +2.5M depuis le mois dernier
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Épargne</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalEpargne.toLocaleString()} FCFA</div>
          <p className="text-xs text-muted-foreground">
            +1.8M depuis le mois dernier
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsOverview;
