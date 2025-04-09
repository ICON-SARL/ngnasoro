
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useSfdAdminDashboard } from '@/hooks/sfd/useSfdAdminDashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, CreditCard, Clock, AlertTriangle } from 'lucide-react';

export function SfdDashboardStats() {
  const { stats, isLoading } = useSfdAdminDashboard();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-3/4 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="pt-6 flex flex-row items-start">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">Clients Total</p>
            <h3 className="text-2xl font-bold">{stats.totalClients}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.activeClients} clients actifs
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 flex flex-row items-start">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">Prêts Actifs</p>
            <h3 className="text-2xl font-bold">{stats.activeLoans}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              sur {stats.totalLoans} prêts
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 flex flex-row items-start">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">En Attente</p>
            <h3 className="text-2xl font-bold">{stats.pendingLoans}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              demandes de prêts à traiter
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 flex flex-row items-start">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">En Retard</p>
            <h3 className="text-2xl font-bold">{stats.overdueLoans}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              prêts avec paiements en retard
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
