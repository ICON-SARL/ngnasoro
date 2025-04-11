
import React from 'react';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SuperAdminDashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SuperAdminHeader />
      
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-semibold mb-6">Tableau de bord Admin MEREF</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total SFD</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15</div>
              <p className="text-xs text-muted-foreground">+2 depuis le mois dernier</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Subventions Actives</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">+5 depuis le mois dernier</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Montant Total Subventions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">85.4M FCFA</div>
              <p className="text-xs text-muted-foreground">+12.3M depuis le mois dernier</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>SFD récemment ajoutées</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Cette section affichera la liste des SFD récemment enregistrées.
              </p>
            </CardContent>
          </Card>
          
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Demandes de subvention en attente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Cette section affichera les demandes de subvention qui nécessitent une approbation.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboardPage;
