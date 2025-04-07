
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface AlertMessagesProps {
  errorMessage: string | null;
  successMessage: string | null;
}

const AlertMessages: React.FC<AlertMessagesProps> = ({ errorMessage, successMessage }) => {
  return (
    <>
      {errorMessage && (
        <Alert className="mb-6 bg-red-50 border-red-200 text-red-800">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Erreur d'inscription</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      
      {successMessage && (
        <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
          <CheckCircle className="h-5 w-5" />
          <AlertTitle>Inscription réussie</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default AlertMessages;
