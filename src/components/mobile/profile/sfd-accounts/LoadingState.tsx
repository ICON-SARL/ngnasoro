
import React from 'react';
import { Loader } from '@/components/ui/loader';

const LoadingState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Loader className="mb-4" />
      <p className="text-sm text-gray-600">
        Chargement de vos comptes SFD...
      </p>
    </div>
  );
};

export default LoadingState;
