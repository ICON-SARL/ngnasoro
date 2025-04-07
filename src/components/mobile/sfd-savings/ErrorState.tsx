
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  message: string;
  retryFn: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ message, retryFn }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4 h-40">
      <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
      <p className="text-sm text-center text-gray-700 mb-3">{message}</p>
      <Button 
        onClick={retryFn}
        variant="outline" 
        size="sm" 
        className="flex items-center"
      >
        <RefreshCw className="h-4 w-4 mr-1" />
        Réessayer
      </Button>
    </div>
  );
};

export default ErrorState;
