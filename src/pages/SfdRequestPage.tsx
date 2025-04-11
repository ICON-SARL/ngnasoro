
import React from 'react';
import { AgencyHeader } from '@/components/AgencyHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SfdRequestPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AgencyHeader />
      
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-semibold mb-6">Demande de subvention</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Formulaire de demande</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Cette page contiendra le formulaire pour soumettre une nouvelle demande de subvention.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SfdRequestPage;
