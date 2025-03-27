
import React from 'react';
import { CardContent } from '@/components/ui/card';

const LoadingState: React.FC = () => {
  return (
    <CardContent className="pt-0 text-center py-6">
      Chargement de vos comptes SFD...
    </CardContent>
  );
};

export default LoadingState;
