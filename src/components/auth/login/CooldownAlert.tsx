
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
    <Alert className="mb-4 bg-amber-50 border-amber-200 rounded-xl shadow-sm">
      <AlertCircle className="h-5 w-5 text-amber-600" />
      <AlertTitle className="text-amber-800 font-medium text-sm">Délai d'attente</AlertTitle>
      <AlertDescription className="text-amber-700 text-sm mt-1">
        Vous pourrez réessayer dans <span className="font-semibold">{remainingTime}</span> secondes
      </AlertDescription>
    </Alert>
  );
};

export default CooldownAlert;
