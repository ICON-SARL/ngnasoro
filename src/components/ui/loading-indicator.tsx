
import React from 'react';

interface LoadingIndicatorProps {
  message?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ message = 'Chargement en cours...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4"></div>
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
};

export default LoadingIndicator;
