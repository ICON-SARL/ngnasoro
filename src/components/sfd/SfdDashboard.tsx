import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, Users, CreditCard, FileBarChart } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useSfdDashboardStats } from '@/hooks/useSfdDashboardStats';

export function SfdDashboard() {
  const { data: stats, isLoading, error } = useSfdDashboardStats();

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertTitle>Erreur de chargement</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : "Une erreur est survenue lors du chargement des statistiques"}
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Portefeuille de prêts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15,500,000 FCFA</div>
            <div className="flex items-center text-xs text-green-500 mt-2">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>+12.5% par rapport au mois dernier</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Clients actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">234</div>
            <div className="flex items-center text-xs text-green-500 mt-2">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>+5.7% par rapport au mois dernier</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taux de remboursement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.8%</div>
            <div className="flex items-center text-xs text-red-500 mt-2">
              <ArrowDownRight className="h-4 w-4 mr-1" />
              <span>-1.2% par rapport au mois dernier</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Nouveaux clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b">
                  <div>
                    <div className="font-medium">Client {i}</div>
                    <div className="text-sm text-muted-foreground">Inscrit le 10/0{i}/2023</div>
                  </div>
                  <div className="text-sm bg-blue-50 text-blue-600 px-2 py-1 rounded">Nouveau</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Prêts récents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b">
                  <div>
                    <div className="font-medium">Prêt #{i}00{i}</div>
                    <div className="text-sm text-muted-foreground">{i}00,000 FCFA sur {i*6} mois</div>
                  </div>
                  <div className="text-sm bg-green-50 text-green-600 px-2 py-1 rounded">Actif</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileBarChart className="h-5 w-5 mr-2" />
            Performance de remboursement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            Graphique de performance sera affiché ici
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
