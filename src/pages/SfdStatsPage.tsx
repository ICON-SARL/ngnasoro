
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { ClientStatsBarChart, ClientStatsPieChart } from '@/components/admin/charts';

const SfdStatsPage = () => {
  const { isSfdAdmin } = usePermissions();

  // Dummy data for charts
  const barChartData = [
    {
      id: 'sfd1',
      name: 'Microfinance A',
      activeClients: 120,
      inactiveClients: 45
    },
    {
      id: 'sfd2',
      name: 'Microfinance B',
      activeClients: 80,
      inactiveClients: 20
    }
  ];

  const pieChartData = [
    { name: 'En règle', value: 65, color: '#22c55e' },
    { name: 'En retard', value: 25, color: '#f97316' },
    { name: 'Impayés', value: 10, color: '#ef4444' }
  ];

  if (!isSfdAdmin) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Accès non autorisé</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Statistiques Clients SFD</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribution des Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientStatsBarChart data={barChartData} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>État des Prêts</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientStatsPieChart data={pieChartData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SfdStatsPage;
