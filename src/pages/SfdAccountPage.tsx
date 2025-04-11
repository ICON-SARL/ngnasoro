
import React from 'react';
import { useParams } from 'react-router-dom';
import { AgencyHeader } from '@/components/AgencyHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SfdAccountPage = () => {
  const { sfdId } = useParams<{ sfdId: string }>();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <AgencyHeader />
      
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-semibold mb-6">Détails du compte SFD</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informations du compte SFD #{sfdId}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Cette page affichera les détails du compte SFD avec l'identifiant: {sfdId}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SfdAccountPage;
