
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Building, 
  Banknote, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  PieChart
} from 'lucide-react';
import { useMerefSfdLoans } from '@/hooks/useMerefSfdLoans';
import { Skeleton } from '@/components/ui/skeleton';

export function MerefSfdLoansStats() {
  const { stats, isLoading } = useMerefSfdLoans();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="pt-4">
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: 'Total Prêts Octroyés',
      value: `${stats.totalAmount.toLocaleString('fr-FR')} FCFA`,
      subtitle: `${stats.totalLoans} prêts`,
      icon: Banknote,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Encours Total',
      value: `${stats.totalOutstanding.toLocaleString('fr-FR')} FCFA`,
      subtitle: `${stats.activeLoans} prêts actifs`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Demandes en Attente',
      value: stats.pendingRequests,
      subtitle: 'À traiter',
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Taux de Recouvrement',
      value: `${stats.recoveryRate.toFixed(1)}%`,
      subtitle: `${stats.completedLoans} remboursés`,
      icon: PieChart,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {stats.defaultedLoans > 0 && (
        <Card className="col-span-2 md:col-span-4 border-destructive/50 bg-destructive/5">
          <CardContent className="pt-4">
            <div className="flex items-center gap-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <div>
                <p className="font-semibold text-destructive">
                  {stats.defaultedLoans} SFD en défaut de paiement
                </p>
                <p className="text-sm text-muted-foreground">
                  Intervention requise pour le recouvrement
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
