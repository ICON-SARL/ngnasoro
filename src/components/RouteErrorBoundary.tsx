
import React from 'react';
import { useRouteError } from 'react-router-dom';
import { AlertOctagon } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

const RouteErrorBoundary = () => {
  const error = useRouteError() as Error;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Alert variant="destructive" className="mb-4">
          <AlertOctagon className="h-5 w-5" />
          <AlertTitle>Erreur de navigation</AlertTitle>
          <AlertDescription>
            {error?.message || "La page demandée n'a pas pu être chargée."}
          </AlertDescription>
        </Alert>
        <div className="flex gap-4">
          <Button 
            onClick={() => window.history.back()}
            variant="outline"
            className="w-full"
          >
            Retour
          </Button>
          <Button 
            onClick={() => window.location.href = '/'}
            className="w-full"
          >
            Accueil
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RouteErrorBoundary;
