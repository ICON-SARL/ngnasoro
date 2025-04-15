
import React from 'react';
import { SfdHeader } from '@/components/sfd/SfdHeader';
import { SfdDashboard } from '@/components/sfd/SfdDashboard';
import { useSfdDashboardMetrics } from '@/hooks/useSfdDashboardMetrics';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

const AgencyDashboard = () => {
  const { data: metrics, isLoading, error, refetch } = useSfdDashboardMetrics();
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SfdHeader />
      
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Tableau de bord SFD</h1>
          <p className="text-muted-foreground">Gestion de votre SFD et de ses services</p>
        </div>
        
        {isLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Skeleton className="h-[150px] w-full" />
              <Skeleton className="h-[150px] w-full" />
              <Skeleton className="h-[150px] w-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-[300px] w-full" />
              <Skeleton className="h-[300px] w-full" />
            </div>
          </div>
        ) : error ? (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur de chargement</AlertTitle>
            <AlertDescription>
              Impossible de charger les données du tableau de bord.
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-4"
                onClick={() => refetch()}
              >
                Réessayer
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <SfdDashboard metrics={metrics} />
        )}
      </main>
    </div>
  );
};

export default AgencyDashboard;
