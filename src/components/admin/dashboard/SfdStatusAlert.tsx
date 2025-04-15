
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSfdStatusCheck } from '@/hooks/useSfdStatusCheck';
import { Button } from '@/components/ui/button';

export const SfdStatusAlert = () => {
  const { data: sfdStatus, isLoading, refetch } = useSfdStatusCheck();
  
  if (isLoading || !sfdStatus || sfdStatus.hasActiveSfds) {
    return null;
  }
  
  const handleRefresh = () => {
    refetch();
  };
  
  return (
    <Alert variant="warning" className="mb-6 border-2 border-amber-400">
      <AlertTriangle className="h-5 w-5 text-amber-600" />
      <AlertTitle className="text-lg text-amber-700">Aucune SFD active détectée</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p className="text-amber-700">
          Aucune SFD active n'a été détectée. Les clients ne pourront pas accéder à la plateforme.
          Veuillez activer au moins une SFD pour permettre l'accès aux services.
        </p>
        <div className="flex flex-wrap gap-3 mt-2">
          <Link 
            to="/sfd-management" 
            className="bg-amber-100 text-amber-800 px-4 py-2 rounded hover:bg-amber-200 inline-flex items-center text-sm font-medium"
          >
            Gérer les SFDs
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
          <Button 
            variant="outline" 
            size="sm"
            className="text-amber-700 border-amber-400"
            onClick={handleRefresh}
          >
            <RefreshCw className="mr-1 h-4 w-4" />
            Vérifier à nouveau
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
