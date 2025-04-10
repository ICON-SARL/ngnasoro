
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface AlertMessagesProps {
  errorMessage: string | null;
  successMessage: string | null;
}

const AlertMessages: React.FC<AlertMessagesProps> = ({ 
  errorMessage, 
  successMessage 
}) => {
  if (!errorMessage && !successMessage) return null;
  
  return (
    <div className="space-y-3 mb-4">
      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      
      {successMessage && (
        <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>Succès</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default AlertMessages;
