
import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingState = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-sm text-muted-foreground">Chargement de vos comptes SFD...</p>
    </div>
  );
};

export default LoadingState;
