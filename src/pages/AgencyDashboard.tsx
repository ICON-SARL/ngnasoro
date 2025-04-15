
import React from 'react';
import { SfdHeader } from '@/components/sfd/SfdHeader';
import { SfdDashboard } from '@/components/sfd/SfdDashboard';
import { useSfdDashboardMetrics } from '@/hooks/useSfdDashboardMetrics';
import { Skeleton } from '@/components/ui/skeleton';

const AgencyDashboard = () => {
  const { data: metrics, isLoading } = useSfdDashboardMetrics();
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SfdHeader />
      
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Tableau de bord SFD</h1>
          <p className="text-muted-foreground">Gestion de votre SFD et de ses services</p>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        ) : (
          <SfdDashboard metrics={metrics} />
        )}
      </main>
    </div>
  );
};

export default AgencyDashboard;
