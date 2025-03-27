
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface CooldownAlertProps {
  active: boolean;
  remainingTime: number;
}

const CooldownAlert = ({ active, remainingTime }: CooldownAlertProps) => {
  if (!active) return null;
  
  return (
    <Alert className="mb-4 bg-amber-50 border-amber-200 rounded-xl">
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800 font-medium">Délai d'attente</AlertTitle>
      <AlertDescription className="text-amber-700">
        Vous pourrez réessayer dans {remainingTime} secondes
      </AlertDescription>
    </Alert>
  );
};

export default CooldownAlert;
