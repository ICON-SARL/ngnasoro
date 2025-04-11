
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  message: string;
  retryFn?: () => void;
  className?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({ message, retryFn, className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center p-5 bg-red-50 rounded-xl my-3 ${className}`}>
      <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
      <h3 className="text-lg font-semibold text-red-700 mb-1">Erreur de synchronisation</h3>
      <p className="text-sm text-center text-red-600 mb-3">
        {message}
      </p>
      {retryFn && (
        <Button 
          onClick={retryFn}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          Réessayer
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
