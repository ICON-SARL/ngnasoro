
import React from 'react';
import { Alert, AlertCircle, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface CooldownAlertProps {
  active: boolean;
  remainingTime: number;
}

const CooldownAlert = ({ active, remainingTime }: CooldownAlertProps) => {
  if (!active) return null;
  
  return (
    <Alert className="mb-4 bg-amber-50 border-amber-200">
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800">Délai d'attente</AlertTitle>
      <AlertDescription className="text-amber-700">
        Vous pourrez réessayer dans {remainingTime} secondes
      </AlertDescription>
    </Alert>
  );
};

export default CooldownAlert;
