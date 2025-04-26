
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  title: string;
  description: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  title, 
  description, 
  onRetry, 
  showRetry = true 
}) => {
  return (
    <Alert variant="destructive" className="mb-6 animate-in fade-in slide-in-from-top-1">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>{description}</span>
        {showRetry && onRetry && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry} 
            className="ml-4 flex items-center"
          >
            <RefreshCw className="mr-1 h-3 w-3" />
            Réessayer
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default ErrorMessage;
