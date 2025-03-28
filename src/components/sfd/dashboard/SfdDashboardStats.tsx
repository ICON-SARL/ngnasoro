
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSfdStats } from '@/hooks/useSfdStats';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { CreditCard, UserCheck, UserClock, BadgeDollarSign } from 'lucide-react';

export function SfdDashboardStats() {
  const { activeSfdId } = useAuth();
  const { data: stats, isLoading } = useSfdStats(activeSfdId);
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                <Skeleton className="h-4 w-24" />
              </CardTitle>
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-36 mb-1" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Crédits Approuvés (Ce mois)</CardTitle>
          <CreditCard className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.approvedCreditsCount}</div>
          <p className="text-xs text-muted-foreground">
            Valeur: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(stats?.approvedCreditsAmount || 0)}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Crédits Rejetés (Ce mois)</CardTitle>
          <CreditCard className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.rejectedCreditsCount}</div>
          <p className="text-xs text-muted-foreground">
            Valeur: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(stats?.rejectedCreditsAmount || 0)}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Solde des Subventions</CardTitle>
          <BadgeDollarSign className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(stats?.subsidyBalance || 0)}
          </div>
          <p className="text-xs text-muted-foreground">
            Fonds disponibles pour les prêts
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Clients</CardTitle>
          <div className="flex space-x-1">
            <UserCheck className="h-4 w-4 text-green-500" />
            <UserClock className="h-4 w-4 text-amber-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.activeClientsCount}</div>
          <p className="text-xs text-muted-foreground">
            {stats?.pendingClientsCount} en attente de validation
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
