
import React from 'react';
import { Loader } from '@/components/ui/loader';

const LoadingState: React.FC = () => {
  return (
    <div className="bg-white rounded-xl p-8 text-center shadow-sm flex flex-col items-center justify-center min-h-[16rem]">
      <Loader className="mb-4 text-[#0D6A51]" size="lg" />
      <h3 className="text-lg font-medium mb-2">Chargement en cours...</h3>
      <p className="text-gray-500">
        Nous récupérons les informations de votre compte SFD
      </p>
    </div>
  );
};

export default LoadingState;
