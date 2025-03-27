
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface ErrorDisplayProps {
  message: string | null;
}

const ErrorDisplay = ({ message }: ErrorDisplayProps) => {
  if (!message) return null;
  
  return (
    <Alert variant="destructive" className="mb-4 rounded-xl border-red-300 bg-red-50 shadow-sm">
      <AlertCircle className="h-5 w-5 text-red-600" />
      <AlertTitle className="text-red-800 font-medium text-sm">Erreur</AlertTitle>
      <AlertDescription className="text-red-700 text-sm mt-1">{message}</AlertDescription>
    </Alert>
  );
};

export default ErrorDisplay;
