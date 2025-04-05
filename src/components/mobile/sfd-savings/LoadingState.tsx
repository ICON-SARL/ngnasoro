
import React from 'react';
import { Loader } from '@/components/ui/loader';

const LoadingState: React.FC = () => {
  return (
    <div className="bg-white rounded-xl p-8 flex flex-col items-center justify-center shadow-sm">
      <Loader size="lg" />
      <p className="mt-4 text-gray-500">Chargement de vos données financières...</p>
    </div>
  );
};

export default LoadingState;
