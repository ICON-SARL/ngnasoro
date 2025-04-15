
import React from 'react';
import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { AlertOctagon, Home, ArrowLeft } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

const RouteErrorBoundary = () => {
  const error = useRouteError();
  
  // Extraire le message d'erreur de différents types d'erreurs
  let errorMessage = "Une erreur inattendue s'est produite";
  let statusText = "Erreur";
  let statusCode = "";
  
  if (isRouteErrorResponse(error)) {
    // Si c'est une erreur de route (ex: 404)
    statusCode = String(error.status);
    statusText = error.statusText;
    errorMessage = error.data?.message || `La page demandée n'a pas pu être chargée.`;
  } else if (error instanceof Error) {
    // Si c'est une erreur JavaScript standard
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    // Si c'est juste une chaîne de caractères
    errorMessage = error;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <AlertOctagon className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {statusCode ? `Erreur ${statusCode}` : "Erreur de navigation"}
          </h1>
          <p className="text-gray-600">
            {statusText !== "Erreur" ? statusText : ""}
          </p>
        </div>
        
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Détails de l'erreur</AlertTitle>
          <AlertDescription>
            {errorMessage}
          </AlertDescription>
        </Alert>
        
        <div className="flex gap-4">
          <Button 
            onClick={() => window.history.back()}
            variant="outline"
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <Button 
            onClick={() => window.location.href = '/'}
            className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
          >
            <Home className="mr-2 h-4 w-4" />
            Accueil
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RouteErrorBoundary;
