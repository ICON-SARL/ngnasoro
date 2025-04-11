
import React from 'react';
import { AgencyHeader } from '@/components/AgencyHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SfdSubsidiesPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AgencyHeader />
      
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-semibold mb-6">Subventions SFD</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Liste des subventions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Cette page affichera la liste des subventions disponibles et demandées.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SfdSubsidiesPage;
