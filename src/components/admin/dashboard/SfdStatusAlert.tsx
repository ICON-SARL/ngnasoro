
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSfdStatusCheck } from '@/hooks/useSfdStatusCheck';

export const SfdStatusAlert = () => {
  const { data: sfdStatus, isLoading } = useSfdStatusCheck();
  
  if (isLoading || !sfdStatus || sfdStatus.hasActiveSfds) {
    return null;
  }
  
  return (
    <Alert variant="warning" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Aucune SFD active</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>
          Aucune SFD active n'a été détectée. Les clients ne pourront pas accéder à la plateforme.
          Veuillez activer au moins une SFD pour permettre l'accès aux services.
        </p>
        <Link 
          to="/sfd-management" 
          className="text-sm font-medium text-amber-600 hover:text-amber-800 inline-flex items-center"
        >
          Aller à la gestion des SFDs
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </AlertDescription>
    </Alert>
  );
};
