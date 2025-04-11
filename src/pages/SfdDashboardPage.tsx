
import React from 'react';
import { AgencyHeader } from '@/components/AgencyHeader';
import { SfdDashboardStats, PendingSubsidies } from '@/components/sfd/dashboard';
import { Card, CardContent } from '@/components/ui/card';

const SfdDashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AgencyHeader />
      
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-semibold mb-6">Tableau de bord SFD</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <SfdDashboardStats />
          
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-medium mb-4">Activité récente</h2>
              <div className="space-y-4">
                <p className="text-gray-600">Pas d'activité récente à afficher.</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-8">
          <h2 className="text-xl font-medium mb-4">Demandes de subvention en attente</h2>
          <PendingSubsidies />
        </div>
      </div>
    </div>
  );
};

export default SfdDashboardPage;
