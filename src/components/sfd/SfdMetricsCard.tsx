
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, Users, Wallet } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useSfdMetrics } from '@/hooks/sfd/useSfdMetrics';

interface SfdMetricsCardProps {
  sfdId: string;
}

export function SfdMetricsCard({ sfdId }: SfdMetricsCardProps) {
  const { metrics, isLoading, updateMetrics } = useSfdMetrics(sfdId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-[250px]" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Métriques de performance</CardTitle>
            <CardDescription>Aperçu des indicateurs clés</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => updateMetrics.mutate()}
            disabled={updateMetrics.isPending}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-4">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Clients actifs</p>
                    <p className="text-2xl font-bold">
                      {metrics?.client_metrics.active_clients || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      +{metrics?.client_metrics.new_clients || 0} aujourd'hui
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-4">
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Prêts actifs</p>
                    <p className="text-2xl font-bold">
                      {metrics?.loan_metrics.active_loans || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Taux de défaut: {metrics?.loan_metrics.default_rate || 0}%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-4">
                  <Wallet className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Portfolio net</p>
                    <p className="text-2xl font-bold">
                      {(metrics?.financial_metrics.net_portfolio || 0).toLocaleString('fr-FR')} FCFA
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Dépôts: {(metrics?.financial_metrics.total_deposits || 0).toLocaleString('fr-FR')} FCFA
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
