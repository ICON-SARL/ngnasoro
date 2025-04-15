
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, FileText } from 'lucide-react';

interface SfdStatsProps {
  stats?: {
    approvedCreditsCount?: number;
    approvedCreditsAmount?: number;
    activeClientsCount?: number;
    pendingClientsCount?: number;
    subsidyBalance?: number;
  };
}

export function SfdStatCards({ stats }: SfdStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Crédits Approuvés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.approvedCreditsCount || 0}</div>
          <div className="flex items-center text-xs text-green-500 mt-2">
            <ArrowUpRight className="h-4 w-4 mr-1" />
            <span>+{stats?.approvedCreditsAmount?.toLocaleString() || 0} FCFA ce mois</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Clients Actifs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.activeClientsCount || 0}</div>
          <div className="flex items-center text-xs text-green-500 mt-2">
            <ArrowUpRight className="h-4 w-4 mr-1" />
            <span>{stats?.pendingClientsCount || 0} en attente</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Solde Subventions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.subsidyBalance?.toLocaleString() || 0} FCFA</div>
          <div className="flex items-center text-xs text-muted-foreground mt-2">
            <FileText className="h-4 w-4 mr-1" />
            <span>Balance courante</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
